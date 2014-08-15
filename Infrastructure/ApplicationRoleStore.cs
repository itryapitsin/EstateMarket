using System.Data.Entity;
using Microsoft.AspNet.Identity.EntityFramework;
using RealtyStore.Models;

namespace RealtyStore.Infrastructure
{
    public class ApplicationRoleStore : RoleStore<ApplicationRole, string, ApplicationUserRole>
    {
        public ApplicationRoleStore(DbContext context)
            : base(context)
        {
        }
    }
}