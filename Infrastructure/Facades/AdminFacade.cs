using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web;
using RealtyStore.Infrastructure;

namespace Home.Web.Infrastructure.Facades
{
    public class AdminFacade
    {
        private static readonly Object SyncObj = new Object();

        public bool InitializeDatabase()
        {
            lock (SyncObj)
            {
                using (var temp = new ApplicationDbContext())
                {
                    ObjectContext oc = null;
                    try
                    {
                        oc = ((IObjectContextAdapter)temp).ObjectContext;
                    }
                    catch (Exception ex)
                    {
                        //Ignore error
                        Console.WriteLine(ex);
                    }

                    if (oc == null)
                    {
                        return true;
                    }
                    //Database.SetInitializer(new MigrateDatabaseToLatestVersion<ApplicationDbContext, Configuration>());
                    try
                    {
                        temp.Database.Initialize(true);
                        return true;
                    }
                    catch (DataException ex)
                    {
                        return false;
                    }
                }
            }
        }

        
    }
}