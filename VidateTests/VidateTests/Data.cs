using System;
using System.Collections.Generic;
using System.Text;

namespace VidateTests
{
    internal class Data
    {
        public const string BASE_URL = "http://localhost:8080";
        public static Credintials credintials;
    }


    struct Credintials
    {
        public string Email;
        public string Password;
    }
}
