using System;
using Assessment.App.Azure;
using Assessment.App.Database;
using Assessment.App.Lti;
using Microsoft.Azure.Cosmos.Fluent;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

[assembly: FunctionsStartup(typeof(Assessment.App.Functions.Startup))]

namespace Assessment.App.Functions
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddHttpClient();
            builder.Services.AddLogging();

            builder.Services.AddSingleton(s =>
            {
                var cosmosDbConnectionString =
                    builder.GetContext().Configuration.GetConnectionString("ReadWritePlatformData");
                var cosmosClientBuilder = new CosmosClientBuilder(cosmosDbConnectionString);
                return cosmosClientBuilder.Build();
            });
            builder.Services.AddSingleton<DatabaseClient>();
            builder.Services.AddSingleton(s =>
            {
                var keyString = Environment.GetEnvironmentVariable("EdnaKeyString");
                return new AppKeyVaultClient(keyString);
            });
            builder.Services.AddSingleton<LtiPlatformClient.Factory>();
            builder.Services.AddSingleton<LtiAssessmentClient.Factory>();
        }
    }
}