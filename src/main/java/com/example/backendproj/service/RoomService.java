package com.example.backendproj.service;

import com.example.backend.model.RoomEntity;
import com.example.backend.pojo.RoomPOJO;

import java.util.List;
import java.util.Optional;

public interface RoomService {
    RoomEntity addRoom(RoomPOJO roomPOJO) throws Exception;
    List<RoomEntity> getAllRooms();
    Optional<RoomEntity> getRoomById(Long id);
    RoomEntity updateRoom(Long id, RoomPOJO roomPOJO) throws Exception;
    void deleteRoom(Long id) throws Exception;
}
