using System.Web;
using System.Web.Optimization;

namespace RealtyStore
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/js")
                .Include("~/scripts/jquery.inputmask.js",
                "~/scripts/jquery.inputmask-multi.js",
                "~/scripts/jquery.inputmask.extensions.js",
                "~/scripts/jquery.inputmask.numeric.extensions.js",
                "~/scripts/from.js",
                "~/scripts/loadMap.js",
                "~/scripts/darkMapPallete.js",
                "~/scripts/lightMapPallete.js",
                "~/scripts/angular-file-upload.js",
                "~/scripts/app/app.js",
                "~/scripts/app/directives/inputmask.js",
                "~/scripts/app/directives/with.js",
                "~/scripts/app/directives/ngDivOpenFile.js",
                "~/scripts/app/directives/ngthumbs.js",
                "~/scripts/app/directives/gmap.js",
                "~/scripts/app/controllers/baseController.js",
                "~/scripts/app/controllers/indexController.js",
                "~/scripts/app/controllers/newAdvertController.js"));

            bundles.Add(new StyleBundle("~/css").Include(
                      "~/Content/site.css",
                      "~/Content/common.css"));

            // Set EnableOptimizations to false for debugging. For more information,
            // visit http://go.microsoft.com/fwlink/?LinkId=301862

#if DEBUG
            BundleTable.EnableOptimizations = false;
#else
            BundleTable.EnableOptimizations = true;
#endif
        }
    }
}
