using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using RealtyStore.Infrastructure;
using RealtyStore.Infrastructure.Services;
using RealtyStore.Infrastructure.Specifications;
using RealtyStore.Models;
using RealtyStore.Models.Business;
using RealtyStore.Models.Requests;

namespace RealtyStore.Controllers
{
    public class HomeController : Controller
    {
        protected AdvertService AdvertService = new AdvertService();

        public ActionResult Index()
        {
            return View();
        }

        //[Route("markers")]
        public ActionResult Markers(AdvertFilter model)
        {
            var result = AdvertService.GetAdverts(model);

            var markers = new List<Marker>
            {
                new Marker
                {
                    CreatedTime = DateTime.Now,
                    Id = "1",
                    Latitude = 61.781956047148000000000000000000,
                    Longitude = 34.318993091583000000000000000000
                },
                new Marker
                {
                    CreatedTime = DateTime.Now,
                    Id = "1",
                    Latitude = 61.781946047148000000000000000000,
                    Longitude = 34.318993091583000000000000000000
                },
                new Marker
                {
                    CreatedTime = DateTime.Now,
                    Id = "1",
                    Latitude = 61.781957047148000000000000000000,
                    Longitude = 34.318993091583000000000000000000
                },new Marker
                {
                    CreatedTime = DateTime.Now,
                    Id = "1",
                    Latitude = 61.781956047148000000000000000000,
                    Longitude = 34.315992091583000000000000000000
                }
            };

            return new JsonNetResult(markers);
        }

       
    }
}