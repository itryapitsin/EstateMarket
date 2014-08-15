using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity.EntityFramework;
using RealtyStore.Models;

namespace RealtyStore.Infrastructure
{
    public class ApplicationUserStore : UserStore<ApplicationUser, ApplicationRole, string, ApplicationUserLogin, ApplicationUserRole, ApplicationUserClaim>
    {
        public ApplicationUserStore(DbContext context): base(context)
        {
        }

        public override Task<ApplicationUser> FindByNameAsync(string userName)
        {
            return Task.Factory.StartNew(() => Users.Include(x => x.Roles).FirstOrDefault(x => x.UserName == userName));
        }
    }
}