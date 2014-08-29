using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RealtyStore.Infrastructure
{
    public static class StringExtensions
    {
        public static string FirstCharToUpper(this string input)
        {
            if (String.IsNullOrEmpty(input))
                throw new ArgumentException("ARGH!");
            return input.First().ToString().ToUpper() + String.Join("", input.Skip(1));
        }
    }
}