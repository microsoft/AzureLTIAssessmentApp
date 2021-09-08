using System.Linq;
using LtiAdvantage.Lti;
using LtiAdvantage.NamesRoleProvisioningService;

namespace Assessment.App.Utils.Lti
{
    public static class LtiExtensions
    {
        public static bool IsStudent(this Member m)
        {
            return m.Roles.Contains(Role.ContextLearner) || m.Roles.Contains(Role.InstitutionLearner);
        }

        public static string GetPicture(this Member m)
        {
            return m.Picture != null ? m.Picture.ToString() : "";
        }
    }
}