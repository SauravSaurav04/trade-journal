package com.example.trade_journal.services;

import com.example.trade_journal.models.UserDto;

public interface UserService {
    public boolean register(UserDto userDto);

    public UserDto getCurrentUserDetails();
}
