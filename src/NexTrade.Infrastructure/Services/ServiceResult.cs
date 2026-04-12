namespace NexTrade.Infrastructure.Services;

public class ServiceResult
{
    public bool Succeeded { get; init; }
    public string? Error { get; init; }
    public int StatusCode { get; init; }
    public Dictionary<string, string[]>? Errors { get; init; }

    public static ServiceResult Ok() => new() { Succeeded = true, StatusCode = 200 };

    public static ServiceResult Fail(string error, int statusCode = 400)
        => new() { Succeeded = false, Error = error, StatusCode = statusCode };

    public static ServiceResult Fail(Dictionary<string, string[]> errors, int statusCode = 400)
        => new() { Succeeded = false, Errors = errors, StatusCode = statusCode };

    public ServiceResult<T> ToTyped<T>()
        => new() { Succeeded = Succeeded, Error = Error, StatusCode = StatusCode, Errors = Errors };
}

public class ServiceResult<T> : ServiceResult
{
    public T? Data { get; init; }

    public static ServiceResult<T> Ok(T data)
        => new() { Succeeded = true, StatusCode = 200, Data = data };

    public static ServiceResult<T> Created(T data)
        => new() { Succeeded = true, StatusCode = 201, Data = data };

    public new static ServiceResult<T> Fail(string error, int statusCode = 400)
        => new() { Succeeded = false, Error = error, StatusCode = statusCode };

    public new static ServiceResult<T> Fail(Dictionary<string, string[]> errors, int statusCode = 400)
        => new() { Succeeded = false, Errors = errors, StatusCode = statusCode };
}
