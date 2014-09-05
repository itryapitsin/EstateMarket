using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data.Entity.Core;
using System.Linq;
using System.Web;
using RealtyStore.Infrastructure.Specifications;
using RealtyStore.Models;
using RealtyStore.Models.Business;
using RealtyStore.Models.Requests;

namespace RealtyStore.Infrastructure.Services
{
    public class AdvertService
    {
        public ApplicationDbContext Context = new ApplicationDbContext();

        public IEnumerable<Advert> GetAdverts(AdvertFilter model)
        {
            IQueryable<Advert> result;

            switch (model.RealtyType)
            {
                case RealtyType.Room: 
                    result = GetRooms(model);
                    break;

                case RealtyType.Apartment:
                    result = GetApartments(model);
                    break;

                case RealtyType.Commercial:
                    result = GetCommerials(model);
                    break;

                case RealtyType.Garage:
                    result = GetGarages(model);
                    break;

                case RealtyType.House:
                    result = GetHouses(model);
                    break;

                case RealtyType.Land:
                    result = GetLands(model);
                    break;

                default: 
                    result = GetAllAdverts(model);
                    break;
            }

            return result
                .SelectSatisfying(new SquareSpecification(
                    model.SquareMin, 
                    model.SquareMax))
                .SelectSatisfying(new GeoSpecification(
                    model.FromLatitude,
                    model.FromLongitude,
                    model.ToLatitude,
                    model.ToLongitude))
                .AsEnumerable();
        }

        public Advert GetAdvert(Guid advertId)
        {
            var advert = Context.Adverts
                .Include("FilesMetaData")
                .FirstOrDefault(x => x.Id == advertId);

            if(advert == null)
                throw new ObjectNotFoundException();

            if(advert.FilesMetaData == null)
                advert.FilesMetaData = new Collection<FileMetaData>();

            return advert;
        }

        private IQueryable<Advert> GetAllAdverts(AdvertFilter model)
        {
            return Context.Adverts
                .Include("FilesMetaData")
                .SelectSatisfying(new AdvertTypeSpecification(model.AdvertType))
                .SelectSatisfying(new AdvertWithPhotoSpecification(model.OnlyWithPhoto))
                .SelectSatisfying(new AdvertCostSpecification(model.MinCost, model.MaxCost));
        }

        private IQueryable<Advert> GetRooms(AdvertFilter model)
        {
            return GetAllAdverts(model)
                .OfType<Room>()
                .SelectSatisfying(new FloorSpecification(model.FloorFilter))
                .SelectSatisfying(new RoomCountSpecification(model.RoomCountFilter))
                .SelectSatisfying(new FloorCountSpecification(model.FloorCountFilter))
                .SelectSatisfying(new ObjectTypeSpecification(model.ObjectType));
        }

        private IQueryable<Advert> GetCommerials(AdvertFilter model)
        {
            return GetAllAdverts(model)
                .OfType<Commercial>()
                .SelectSatisfying(new ObjectTypeSpecification(model.ObjectType));
        }

        private IQueryable<Advert> GetGarages(AdvertFilter model)
        {
            return GetAllAdverts(model)
                .OfType<Garage>()
                .SelectSatisfying(new ObjectTypeSpecification(model.ObjectType));
        }

        private IQueryable<Advert> GetHouses(AdvertFilter model)
        {
            return GetAllAdverts(model)
                .OfType<House>()
                .SelectSatisfying(new ObjectTypeSpecification(model.ObjectType));
        }

        private IQueryable<Advert> GetLands(AdvertFilter model)
        {
            return GetAllAdverts(model)
                .OfType<Land>();
        }

        private IQueryable<Advert> GetApartments(AdvertFilter model)
        {
            return GetAllAdverts(model)
                .Where(x => x.RealtyType == RealtyType.Apartment)
                .OfType<Apartment>()
                .SelectSatisfying(new FloorSpecification(model.FloorFilter))
                .SelectSatisfying(new RoomCountSpecification(model.RoomCountFilter))
                .SelectSatisfying(new FloorCountSpecification(model.FloorCountFilter))
                .SelectSatisfying(new ObjectTypeSpecification(model.ObjectType));
        }
    }
}