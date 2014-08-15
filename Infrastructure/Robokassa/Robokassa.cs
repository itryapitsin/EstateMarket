using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace Home.Web.Infrastructure.Robokassa
{
    public static class Robokassa
    {
        public static string GetRedirectUrl(int priceRub, int orderId, string email = "")
        {
            // ugly code, legacy from Robokassa website

            // your registration data
            var sMrchLogin = RobokassaConfig.Login;
            var sMrchPass1 = RobokassaConfig.Pass1;
            // order properties
            decimal nOutSum = priceRub;
            var nInvId = orderId;
            var sDesc = "desc";

            var sOutSum = nOutSum.ToString("0.00", CultureInfo.InvariantCulture);
            var sCrcBase = string.Format("{0}:{1}:{2}:{3}",
                                             sMrchLogin, sOutSum, nInvId, sMrchPass1);

            // build CRC value
            var md5 = new MD5CryptoServiceProvider();
            var bSignature = md5.ComputeHash(Encoding.ASCII.GetBytes(sCrcBase));

            var sbSignature = new StringBuilder();
            foreach (var b in bSignature)
                sbSignature.AppendFormat("{0:x2}", b);

            var sCrc = sbSignature.ToString();

            return GetBaseUrl() +
                "MrchLogin=" + sMrchLogin +
                "&OutSum=" + sOutSum +
                "&InvId=" + nInvId +
                "&Desc=" + sDesc +
                "&SignatureValue=" + sCrc +
                (String.IsNullOrEmpty(email) ? "" : "&Email=" + email);
        }

        private static string GetBaseUrl()
        {
            switch (RobokassaConfig.Mode)
            {
                case RobokassaMode.Test:
                    return "http://test.robokassa.ru/Index.aspx?";

                case RobokassaMode.Production:
                    return "https://auth.robokassa.ru/Merchant/Index.aspx?";

                default:
                    throw new NotSupportedException();
            }
        }
    }
}