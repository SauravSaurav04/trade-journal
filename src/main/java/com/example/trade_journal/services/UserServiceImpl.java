package com.example.trade_journal.services;

import com.example.trade_journal.entities.User;
import com.example.trade_journal.models.UserDto;
import com.example.trade_journal.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public boolean register(UserDto userDto) {

        if (userRepository.existsByEmail(userDto.getEmail())) {
            return false;
        }

        User user = User.builder()
                .name(userDto.getName())
                .email(userDto.getEmail())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .build();

        userRepository.save(user);
        return true;
    }
}
