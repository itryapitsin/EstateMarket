using System;
using Microsoft.AspNet.Identity.EntityFramework;

namespace RealtyStore.Models
{
    public class ApplicationRole : IdentityRole<string, ApplicationUserRole>
    {
        public ApplicationRole()
        {
            Id = Guid.NewGuid().ToString();
        }

        public ApplicationRole(string name):this()
        {
            Name = name;
        }
    }
}