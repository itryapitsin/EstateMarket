using System;
using System.Linq.Expressions;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure.Specifications
{
    public class GeoSpecification: Specification<Advert>
    {
        public double FromLatitude { get; set; } 
        public double FromLongitude { get; set; }
        public double ToLatitude { get; set; }
        public double ToLongitude { get; set; }

        public GeoSpecification(
            double fromLatitude,
            double fromLongitude,
            double toLatitude,
            double toLongitude)
        {
            FromLatitude = fromLatitude;
            FromLongitude = fromLongitude;
            ToLatitude = toLatitude;
            ToLongitude = toLongitude;
        }

        public override Expression<Func<Advert, bool>> IsSatisfied()
        {
            return advert => advert.Latitude > FromLatitude
                && advert.Latitude < ToLatitude
                && advert.Longtitude > FromLongitude
                && advert.Longtitude < ToLongitude;
        }
    }
}