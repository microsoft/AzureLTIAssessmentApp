using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Assessment.App.Database;
using Assessment.App.Database.Model;
using Assessment.App.Functions.Platform.Dto;
using Assessment.App.Utils.Http;
using Azure.Identity;
using Azure.Security.KeyVault.Keys;
using IdentityModel;
using IdentityModel.Jwk;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using JsonSerializer = System.Text.Json.JsonSerializer;
using IMJsonWebKey = IdentityModel.Jwk.JsonWebKey;


namespace Assessment.App.Functions.Platform
{
    /// <summary>
    /// Azure Functions used by the Platform Registration Page.
    /// </summary>
    public class PlatformApi
    {
        private static readonly string BaseApiUrl = Environment.GetEnvironmentVariable("BaseApiUrl").TrimEnd('/');
        private static readonly string KeyVaultUrl = Environment.GetEnvironmentVariable("KeyVaultUrl").TrimEnd('/');

        private readonly DatabaseClient _databaseClient;
        
        public PlatformApi(DatabaseClient databaseClient)
        {
            _databaseClient = databaseClient;
        }
        
        [FunctionName("GetPlatformData")]
        public async Task<IActionResult> GetPlatformData(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "platform")]
            HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");
            var platformInfoItem = await _databaseClient.GetPlatformInfo();
            var keyClient = new KeyClient(
                new Uri(KeyVaultUrl),
                // new Uri("https://assessment-app-kv.vault.azure.net/"),
                // new Uri("https://assessment-app-key-vault.vault.azure.net"),
                new DefaultAzureCredential());
            // new AzureCliCredential());
            KeyVaultKey key = await keyClient.GetKeyAsync("EdnaLiteDevKey");
            IMJsonWebKey publicKey = new IMJsonWebKey()
            {
                Kid = key.Key.Id,
                Kty = JsonWebAlgorithmsKeyTypes.RSA,
                Alg = Microsoft.IdentityModel.Tokens.SecurityAlgorithms.RsaSha256,
                Use = Microsoft.IdentityModel.Tokens.JsonWebKeyUseNames.Sig,
                E = Base64Url.Encode(key.Key.E),
                N = Base64Url.Encode(key.Key.N)
            };

            var response = new PlatformResponse()
            {
                DisplayName = platformInfoItem.DisplayName,
                Issuer = platformInfoItem.Issuer,
                JwkSetUrl = platformInfoItem.JwkSetUrl,
                AccessTokenUrl = platformInfoItem.AccessTokenUrl,
                AuthorizationUrl = platformInfoItem.AuthorizationUrl,
                LoginUrl = $"{BaseApiUrl}/api/oidc-login",
                LaunchUrl = $"{BaseApiUrl}/api/lti-advantage-launch",
                DomainUrl = BaseApiUrl,
                ClientId = platformInfoItem.ClientId,
                PublicKey = ExportPublicKey(key.Key.ToRSA().ExportParameters(false)),
                PublicJwk = JsonSerializer.Serialize(publicKey),
                PublicJwkSetUrl = $"{BaseApiUrl}/api/jwks",
                InstitutionName = platformInfoItem.InstitutionName,
                LogoUrl = platformInfoItem.LogoUrl,
            };

            return new OkObjectResult(response);
        }

        [FunctionName("UpdatePlatformData")]
        public async Task<IActionResult> UpdatePlatformData(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "platform")]
            HttpRequest req,
            [CosmosDB(
                databaseName: "assessment-app-db",
                collectionName: "platform-registration-container",
                ConnectionStringSetting = "ReadWritePlatformData",
                Id = "main")]
            IAsyncCollector<PlatformInfoItem> databaseItemOut,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");
            var requestData = await req.ReadJsonBody<PlatformUpdateRequest>();
            var platformInfoItem = new PlatformInfoItem()
            {
                Id = "main",
                DisplayName = requestData.DisplayName,
                Issuer = requestData.Issuer,
                JwkSetUrl = requestData.JwkSetUrl,
                AccessTokenUrl = requestData.AccessTokenUrl,
                AuthorizationUrl = requestData.AuthorizationUrl,
                ClientId = requestData.ClientId,
                InstitutionName = requestData.InstitutionName,
                LogoUrl = requestData.LogoUrl,
            };
            await databaseItemOut.AddAsync(platformInfoItem);
            return new OkObjectResult(null);
        }

        // https://stackoverflow.com/questions/28406888/c-sharp-rsa-public-key-output-not-correct
        private static string ExportPublicKey(RSAParameters parameters)
        {
            StringBuilder resultStringBuilder = new StringBuilder();
            using var stream = new MemoryStream();

            using var writer = new BinaryWriter(stream);
            writer.Write((byte) 0x30); // SEQUENCE

            using (var innerStream = new MemoryStream())
            {
                var innerWriter = new BinaryWriter(innerStream);
                innerWriter.Write((byte) 0x30); // SEQUENCE
                EncodeLength(innerWriter, 13);
                innerWriter.Write((byte) 0x06); // OBJECT IDENTIFIER
                var rsaEncryptionOid = new byte[] {0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01};
                EncodeLength(innerWriter, rsaEncryptionOid.Length);
                innerWriter.Write(rsaEncryptionOid);
                innerWriter.Write((byte) 0x05); // NULL
                EncodeLength(innerWriter, 0);
                innerWriter.Write((byte) 0x03); // BIT STRING
                using (var bitStringStream = new MemoryStream())
                {
                    var bitStringWriter = new BinaryWriter(bitStringStream);
                    bitStringWriter.Write((byte) 0x00); // # of unused bits
                    bitStringWriter.Write((byte) 0x30); // SEQUENCE
                    using (var paramsStream = new MemoryStream())
                    {
                        var paramsWriter = new BinaryWriter(paramsStream);
                        EncodeIntegerBigEndian(paramsWriter, parameters.Modulus); // Modulus
                        EncodeIntegerBigEndian(paramsWriter, parameters.Exponent); // Exponent
                        var paramsLength = (int) paramsStream.Length;
                        EncodeLength(bitStringWriter, paramsLength);
                        bitStringWriter.Write(paramsStream.GetBuffer(), 0, paramsLength);
                    }

                    var bitStringLength = (int) bitStringStream.Length;
                    EncodeLength(innerWriter, bitStringLength);
                    innerWriter.Write(bitStringStream.GetBuffer(), 0, bitStringLength);
                }

                var length = (int) innerStream.Length;
                EncodeLength(writer, length);
                writer.Write(innerStream.GetBuffer(), 0, length);
            }

            var base64 = Convert.ToBase64String(stream.GetBuffer(), 0, (int) stream.Length).ToCharArray();

            using TextWriter outputStream = new StringWriter();
            outputStream.WriteLine("-----BEGIN PUBLIC KEY-----");
            for (var i = 0; i < base64.Length; i += 64)
            {
                outputStream.WriteLine(base64, i, Math.Min(64, base64.Length - i));
            }

            outputStream.WriteLine("-----END PUBLIC KEY-----");

            return outputStream.ToString();
        }

        private static void EncodeLength(BinaryWriter stream, int length)
        {
            if (length < 0) throw new ArgumentOutOfRangeException(nameof(length), "Length must be non-negative");
            if (length < 0x80)
            {
                // Short form
                stream.Write((byte) length);
            }
            else
            {
                // Long form
                var temp = length;
                var bytesRequired = 0;
                while (temp > 0)
                {
                    temp >>= 8;
                    bytesRequired++;
                }

                stream.Write((byte) (bytesRequired | 0x80));
                for (var i = bytesRequired - 1; i >= 0; i--)
                {
                    stream.Write((byte) (length >> (8 * i) & 0xff));
                }
            }
        }

        private static void EncodeIntegerBigEndian(BinaryWriter stream, byte[] value, bool forceUnsigned = true)
        {
            stream.Write((byte) 0x02); // INTEGER
            var prefixZeros = 0;
            for (var i = 0; i < value.Length; i++)
            {
                if (value[i] != 0) break;
                prefixZeros++;
            }

            if (value.Length - prefixZeros == 0)
            {
                EncodeLength(stream, 1);
                stream.Write((byte) 0);
            }
            else
            {
                if (forceUnsigned && value[prefixZeros] > 0x7f)
                {
                    // Add a prefix zero to force unsigned if the MSB is 1
                    EncodeLength(stream, value.Length - prefixZeros + 1);
                    stream.Write((byte) 0);
                }
                else
                {
                    EncodeLength(stream, value.Length - prefixZeros);
                }

                for (var i = prefixZeros; i < value.Length; i++)
                {
                    stream.Write(value[i]);
                }
            }
        }
    }
}