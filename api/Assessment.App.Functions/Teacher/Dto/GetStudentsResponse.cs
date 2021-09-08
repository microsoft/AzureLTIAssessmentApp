using System.Collections.Generic;

namespace Assessment.App.Functions.Teacher.Dto
{
    public class GetStudentsResponse
    {
        public List<MemberDto> Students { get; set; } = new List<MemberDto>();
    }
}