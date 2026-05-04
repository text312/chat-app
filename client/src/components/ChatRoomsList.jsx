function ChatRoomsList({
  rooms,
  currentRoomId,
  currentUserId,
  onJoin,
  onLeave,
  isLoading,
}) {
  return (
    <section>
      <h3>Available Chat Rooms</h3>
      {rooms.length === 0 ? (
        <p>No rooms yet. Create the first room.</p>
      ) : (
        <ul>
          {rooms.map((room) => {
            const isCurrent = room._id === currentRoomId;
            const isMember = room.members.some(
              (member) => member._id === currentUserId
            );

            return (
              <li key={room._id}>
                <strong>{room.name}</strong> ({room.members.length} users)
                <div>
                  {!isMember ? (
                    <button disabled={isLoading} onClick={() => onJoin(room._id)}>
                      Join
                    </button>
                  ) : (
                    <button disabled={isLoading} onClick={() => onLeave(room._id)}>
                      Leave
                    </button>
                  )}
                  {isCurrent && <span> In room</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default ChatRoomsList;
