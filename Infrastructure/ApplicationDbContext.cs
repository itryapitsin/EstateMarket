using System.Data.Entity;
using System.Linq;
using Microsoft.AspNet.Identity.EntityFramework;
using RealtyStore.Infrastructure.Specifications;
using RealtyStore.Models;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string, ApplicationUserLogin, ApplicationUserRole, ApplicationUserClaim>
    {
        public ApplicationDbContext(): base("DefaultConnection") {}

        public IQueryable<T> SelectSatisfying<T>(Specification<T> specification) where T: class 
        {
            return Set<T>().Where(specification.IsSatisfied());
        }

        public static ApplicationDbContext Create()
        {
            return new ApplicationDbContext();
        }

        public DbSet<FileMetaData> FileMetaData { get; set; }

        public DbSet<Advert> Adverts { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder
                .Entity<FileMetaData>()
                .HasKey(x => x.Id);

            modelBuilder
                .Entity<ApplicationUser>()
                .HasKey(x => x.Id);

            modelBuilder
                .Entity<Advert>()
                .HasKey(x => x.Id);

            modelBuilder
                .Entity<Advert>()
                .Property(x => x.Latitude)
                .IsRequired();

            modelBuilder
                .Entity<Advert>()
                .Property(x => x.Longtitude)
                .IsRequired();

            modelBuilder
                .Entity<Advert>()
                .Property(x => x.CreatedTime)
                .IsRequired();

            modelBuilder
                .Entity<Advert>()
                .Property(x => x.AdvertType)
                .IsRequired();

            modelBuilder
                .Entity<Advert>()
                .Property(x => x.RealtyType)
                .IsRequired();

            base.OnModelCreating(modelBuilder);
        }
    }

    public static class QueryableExtention
    {
        public static IQueryable<T> SelectSatisfying<T>(
            this IQueryable<T> set, 
            Specification<T> specification) where T : class
        {
            return set.Where(specification.IsSatisfied());
        }
    }
}