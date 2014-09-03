using System;
using System.Collections.Generic;
using System.Data.Entity.Core;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using Home.Web.Infrastructure;
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

        [HttpPost]
        public ActionResult PublishNewAdvert([AbstractBind(ConcreteTypeParameter = "realtyType", Path = "RealtyStore.Models.Business")]Advert model)
        {
            model.CreatedTime = DateTime.UtcNow;
            model.Id = Guid.NewGuid();

            AdvertService.Context.Adverts.Add(model);
            AdvertService.Context.SaveChanges();

            return new JsonNetResult(new {Id = model.Id});
        }

        [HttpPost]
        public ActionResult UploadImage(Guid advertId)
        {
            try
            {
                var advert = AdvertService.GetAdvert(advertId);

                var file = System.Web.HttpContext.Current.Request.Files[0];
                var ext = Path.GetExtension(file.FileName).ToUpper();
                var path = Server.MapPath("~/Content/images/adverts/" + advertId);

                if (!Directory.Exists(path))
                    Directory.CreateDirectory(path);

                var fileName = Guid.NewGuid().ToString().ToUpper();

                file.SaveAs(path + "\\" + fileName + ext);

                advert.FilesMetaData.Add(new FileMetaData
                {
                    Type = FileMetaDataType.Image,
                    Filename = fileName + ext
                });

                AdvertService.Context.SaveChanges();

                return new HttpStatusCodeResult(HttpStatusCode.OK);
            }
            catch (ObjectNotFoundException e)
            {
                return new HttpNotFoundResult();
            }
        }
    }
}