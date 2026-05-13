using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bl_layer.Api
{
    public interface IEmailService
    {
        void SendVerificationEmail(string email, string token);
        void SendPasswordResetEmail(string email);
        void SendLoginVerificationEmail(string email);
    }
}
