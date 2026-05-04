function ChatRoomsList({
  rooms,
  currentRoomId,
  currentUserId,
  onJoin,
  onLeave,
  isLoading,
}) {
  return (
    <section className="rooms-list-section">
      <h3>Available Chat Rooms</h3>
      {rooms.length === 0 ? (
        <p>No rooms yet. Create the first room.</p>
      ) : (
        <ul className="rooms-list">
          {rooms.map((room) => {
            const isCurrent = room._id === currentRoomId;
            const isMember = room.members.some(
              (member) => member._id === currentUserId
            );

            return (
              <li key={room._id} className={isCurrent ? "room-item active" : "room-item"}>
                <div className="room-meta">
                  <strong>{room.name}</strong>
                  <span>{room.members.length} users</span>
                </div>
                <div className="room-actions">
                  {!isMember ? (
                    <button disabled={isLoading} onClick={() => onJoin(room._id)}>
                      Join
                    </button>
                  ) : (
                    <button disabled={isLoading} onClick={() => onLeave(room._id)}>
                      Leave
                    </button>
                  )}
                  {isCurrent ? <span className="room-badge">In room</span> : null}
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
