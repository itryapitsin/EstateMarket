using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure.Specifications
{
    public class AdvertWithPhotoSpecification: Specification<Advert>
    {
        private readonly bool _onlyWithPhoto;

        public AdvertWithPhotoSpecification(bool onlyWithPhoto)
        {
            _onlyWithPhoto = onlyWithPhoto;
        }

        public override Expression<Func<Advert, bool>> IsSatisfied()
        {
            return advert => !_onlyWithPhoto || advert.FilesMetaData.Any();
        }
    }
}