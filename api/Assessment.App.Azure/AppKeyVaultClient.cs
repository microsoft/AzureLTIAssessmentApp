using Microsoft.Azure.Services.AppAuthentication;
using Microsoft.IdentityModel.KeyVaultExtensions;
using Microsoft.IdentityModel.Tokens;

namespace Assessment.App.Azure
{
    public class AppKeyVaultClient
    {
        private readonly string _keyString;
        
        public AppKeyVaultClient(string keyString)
        {
            _keyString = keyString;
        }

        public SigningCredentials GetSigningCredentials()
        {
            var azureServiceTokenProvider = new AzureServiceTokenProvider();
            var keyVaultAuthCallback = new KeyVaultSecurityKey.AuthenticationCallback(azureServiceTokenProvider.KeyVaultTokenCallback);
            var keyVaultSecurityKey = new KeyVaultSecurityKey(_keyString, keyVaultAuthCallback);
            var cryptoProviderFactory = new CryptoProviderFactory { CustomCryptoProvider = new KeyVaultCryptoProvider() };

            return new SigningCredentials(keyVaultSecurityKey, SecurityAlgorithms.RsaSha256) { CryptoProviderFactory = cryptoProviderFactory };
        }
    }
}