using System.ComponentModel.DataAnnotations.Schema;
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
                .Property(x => x.Longitude)
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

            //modelBuilder
            //    .Entity<Advert>()
            //    .Map<Apartment>(x => x.Requires("RealtyType").HasValue(2))
            //    .Map<Commercial>(x => x.Requires("RealtyType").HasValue(6))
            //    .Map<Garage>(x => x.Requires("RealtyType").HasValue(5))
            //    .Map<House>(x => x.Requires("RealtyType").HasValue(3))
            //    .Map<Land>(x => x.Requires("RealtyType").HasValue(4))
            //    .Map<Room>(x => x.Requires("RealtyType").HasValue(1));

            modelBuilder
                .Entity<Apartment>()
                .Map(x =>
                {
                    x.ToTable("Apartments");
                    x.MapInheritedProperties();
                });

            modelBuilder
                .Entity<Commercial>()
                .Map(x =>
                {
                    x.MapInheritedProperties();
                    x.ToTable("Commercials");
                });

            modelBuilder
                .Entity<Garage>()
                .Map(x =>
                {
                    x.MapInheritedProperties();
                    x.ToTable("Garages");
                });

            modelBuilder
                .Entity<House>()
                .Map(x =>
                {
                    x.MapInheritedProperties();
                    x.ToTable("Houses");
                });

            modelBuilder
                .Entity<Land>()
                .Map(x =>
                {
                    x.MapInheritedProperties();
                    x.ToTable("Lands");
                });

            modelBuilder
                .Entity<Room>()
                .Map(x =>
                {
                    x.ToTable("Rooms");
                    x.MapInheritedProperties();
                });

            //modelBuilder.Entity<Advert>().ToTable("Adverts");
            //modelBuilder.Entity<Apartment>().ToTable("Apartments");
            //modelBuilder.Entity<Commercial>().ToTable("Commercials");
            //modelBuilder.Entity<Garage>().ToTable("Garages");
            //modelBuilder.Entity<House>().ToTable("Houses");
            //modelBuilder.Entity<Land>().ToTable("Lands");
            //modelBuilder.Entity<Room>().ToTable("Rooms");
                

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