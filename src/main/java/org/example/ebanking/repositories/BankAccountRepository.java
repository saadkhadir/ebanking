package org.example.ebanking.repositories;

import org.example.ebanking.entities.BankAccount;
import org.springframework.data.repository.CrudRepository;

public interface BankAccountRepository extends CrudRepository<BankAccount, Long> {
}
