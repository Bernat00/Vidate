namespace VidateTests.Models;

public record ProfileSetupCase(
    string FirstName,
    string? MiddleName,
    string LastName,
    string BirthDate,
    string Gender,
    string? Religion,
    string? SelfIsSmoker,
    int? PrefAgeMin,
    int? PrefAgeMax,
    string? SelfWantsChildren,
    string? PrefWantsChildren,
    string? PrefIsSmoker,
    string[]? Languages,
    string[]? PreferredGenders,
    string[]? PreferredReligions);
