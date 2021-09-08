using System.Runtime.Serialization;

namespace Assessment.App.Database.Model
{
    public enum StudentResponseStatus
    {
        [EnumMember(Value = "Not started")]
        NotStarted,
        [EnumMember(Value = "In progress")]
        InProgress,
        [EnumMember(Value = "Complete")]
        Complete,
    }
}