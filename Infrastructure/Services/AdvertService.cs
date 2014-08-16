using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using RealtyStore.Infrastructure.Specifications;
using RealtyStore.Models.Business;
using RealtyStore.Models.Requests;

namespace RealtyStore.Infrastructure.Services
{
    public class AdvertService
    {
        protected ApplicationDbContext Context = new ApplicationDbContext();

        public IEnumerable<Advert> GetAdverts(AdvertFilter model)
        {
            IQueryable<Advert> result;

            switch (model.RealtyType)
            {
                case RealtyType.Rooms: 
                    result = GetRooms(model);
                    break;

                default: 
                    result = GetAllAdverts(model);
                    break;
            }

            return result
                .SelectSatisfying(new GeoSpecification(
                    model.FromLatitude,
                    model.FromLongitude,
                    model.ToLatitude,
                    model.ToLongitude))
                .AsEnumerable();
        }

        private IQueryable<Advert> GetAllAdverts(AdvertFilter model)
        {
            return Context.Adverts
                .SelectSatisfying(new AdvertTypeSpecification(model.AdvertType))
                .SelectSatisfying(new AdvertWithPhotoSpecification(model.OnlyWithPhoto))
                .SelectSatisfying(new AdvertCostSpecification(model.MinCost, model.MaxCost));
        }

        private IQueryable<Advert> GetRooms(AdvertFilter model)
        {
            return GetAllAdverts(model)
                .OfType<Room>()
                .SelectSatisfying(new RoomFloorSpecification(model.FloorFilter))
                .SelectSatisfying(new RoomCountSpecification(model.RoomCountFilter))
                .SelectSatisfying(new RoomFloorCountSpecification(model.FloorCountFilter));
        }
    }
}