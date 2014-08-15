using System;
using System.Security.Cryptography;
using System.Text;

namespace Home.Web.Infrastructure.Robokassa
{
    public class RobokassaConfirmationRequest
    {
        public string OutSum { get; set; }
        public int InvId { get; set; }
        public string SignatureValue { get; set; }

        // in Robokassa we have two types of back-queries:
        //
        // 1. ResultURL query
        //    Robokassa server tries to get this url
        //    Requires Pass2 (!!!)
        //
        // 2. SuccessUrl query
        //    Robokassa redirects user to this url
        //    Requires Pass1 (!!!)

        public bool IsQueryValid(RobokassaQueryType queryType)
        {
            var currentPassword = (queryType == RobokassaQueryType.ResultURL) 
                ? RobokassaConfig.Pass2 
                : RobokassaConfig.Pass1;

            var str = string.Format("{0}:{1}:{2}",
                                    OutSum, InvId, currentPassword);

            var md5 = new MD5CryptoServiceProvider();
            var calculatedSignature = md5.ComputeHash(Encoding.ASCII.GetBytes(str));

            var sbSignature = new StringBuilder();

            foreach (var b in calculatedSignature)
                sbSignature.AppendFormat("{0:x2}", b);

            return string.Equals(
                sbSignature.ToString(),
                SignatureValue,
                StringComparison.InvariantCultureIgnoreCase);
        }
    }
}