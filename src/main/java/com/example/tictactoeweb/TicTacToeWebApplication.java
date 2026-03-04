package com.example.tictactoeweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@SpringBootApplication
@ComponentScan(basePackages = {"com.example.tictactoeweb"})
@Controller
public class TicTacToeWebApplication extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(TicTacToeWebApplication.class, args);
    }

    @GetMapping("/")
    public String redirect() {
        return "redirect:/index.html";
    }
}
