using System.Data.Entity.Migrations;
using RealtyStore.Infrastructure;

namespace RealtyStore.Migrations
{
    internal sealed class Configuration : DbMigrationsConfiguration<ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(ApplicationDbContext context)
        {
        }

    }
}
