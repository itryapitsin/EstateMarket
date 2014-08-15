using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using RealtyStore.Models;

namespace RealtyStore.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        //[Route("markers")]
        public ActionResult Markers(double fromLatitude, double fromLongitude, double toLatitude, double toLongitude)
        {
            var markers = new List<Marker>
            {
                new Marker
                {
                    CreatedTime = DateTime.Now,
                    Id = "1",
                    Latitude = 61.681956047148000000000000000000,
                    Longitude = 34.318993091583000000000000000000
                }
            };

            return new JsonNetResult(markers);
        }

       
    }
}