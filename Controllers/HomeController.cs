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
            var markers = AdvertService.GetAdverts(model);
            return new JsonNetResult(markers);
        }

       
    }
}