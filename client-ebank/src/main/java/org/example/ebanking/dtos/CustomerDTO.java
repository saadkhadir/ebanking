package org.example.ebanking.dtos;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.ebanking.entities.BankAccount;


import java.util.List;

@Data
public class CustomerDTO {
    private Long id;
    private String name;
    private String email;
}