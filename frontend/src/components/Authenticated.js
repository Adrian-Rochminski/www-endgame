export const UserSession = (session) => {

    return (
        <>
            <h1>Client Session</h1>
            { session != null ? (<>
                <a>authenticated</a>
                <pre>{JSON.stringify(session, null, 2)}</pre>
            </>) : (
                <a>unauthenticated</a>
            )}
        </>
    );
};