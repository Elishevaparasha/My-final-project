using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bl_layer.Api
{
    public interface IEmailService
    {
        bool CanSendRealEmail { get; }
        void SendVerificationEmail(string email, string token);
        void SendPasswordResetCodeEmail(string email, string code);
        void SendPasswordResetEmail(string email);
        void SendLoginVerificationEmail(string email);
    }
}
