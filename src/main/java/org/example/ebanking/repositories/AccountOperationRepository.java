package org.example.ebanking.repositories;

import org.example.ebanking.entities.AccountOperation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountOperationRepository extends JpaRepository<AccountOperation , Long> {
}
