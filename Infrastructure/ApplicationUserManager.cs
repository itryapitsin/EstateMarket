using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using WebGrease.Css.Extensions;
using RealtyStore.Models;

namespace RealtyStore.Infrastructure
{
    public class ApplicationUserManager : UserManager<ApplicationUser, string>
    {
        public ApplicationUserManager(IUserStore<ApplicationUser, string> store): base(store)
        {
        }

        public static ApplicationUserManager Create(IdentityFactoryOptions<ApplicationUserManager> options, IOwinContext context)
        {
            var manager = new ApplicationUserManager(new ApplicationUserStore(new ApplicationDbContext()));
            // Configure the application user manager
            manager.UserValidator = new UserValidator<ApplicationUser>(manager)
            {
                AllowOnlyAlphanumericUserNames = false,
                RequireUniqueEmail = true
            };
            manager.PasswordValidator = new MinimumLengthValidator(8);

            return manager;
        }

        public override Task<IdentityResult> CreateAsync(ApplicationUser user)
        {
            user.RegistrationDate = DateTime.UtcNow;
            user.LastVisitDate = DateTime.UtcNow;

            return base.CreateAsync(user);
        }
    }
}