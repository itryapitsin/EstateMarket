using Home.Web.Infrastructure;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using RealtyStore.Models;

namespace RealtyStore.Infrastructure
{
    public class ApplicationRoleManager : RoleManager<ApplicationRole>
    {
        public ApplicationRoleManager(IRoleStore<ApplicationRole, string> roleStore): base(roleStore) {}

        public static ApplicationRoleManager Create(
            IdentityFactoryOptions<ApplicationRoleManager> options, 
            IOwinContext context)
        {
            return new ApplicationRoleManager(
                new ApplicationRoleStore(
                    context.Get<ApplicationDbContext>()));
        }
    }
}