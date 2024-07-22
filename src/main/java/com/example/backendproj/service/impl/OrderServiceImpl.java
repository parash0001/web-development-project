package com.example.backendproj.service.impl;

import com.example.backend.model.OrderEntity;
import com.example.backend.repository.OrderRepository;
import com.example.backend.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public OrderEntity placeOrder(OrderEntity order) {
        try {
            return orderRepository.save(order);
        } catch (DataIntegrityViolationException e) {
            log.error("DataIntegrityViolationException: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Exception: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public OrderEntity getOrderById(String id) {
        return orderRepository.findById(Long.valueOf(id)).orElse(null);
    }

    @Override
    public List<OrderEntity> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public OrderEntity updateOrder(String id, OrderEntity order) {
        order.setId(Long.valueOf(id));
        return orderRepository.save(order);
    }

    @Override
    public void deleteOrder(String id) {
        orderRepository.deleteById(Long.valueOf(id));
    }
}
