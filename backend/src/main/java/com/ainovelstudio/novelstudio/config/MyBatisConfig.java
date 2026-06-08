package com.ainovelstudio.novelstudio.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.type.JdbcType;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class MyBatisConfig implements InitializingBean {

    @Autowired
    private SqlSessionFactory sqlSessionFactory;

    @Override
    public void afterPropertiesSet() {
        var registry = sqlSessionFactory.getConfiguration().getTypeHandlerRegistry();
        registry.register(List.class, JdbcType.VARCHAR, JsonStringListTypeHandler.class);
        registry.register(JsonStringListTypeHandler.class);
        System.out.println("[MyBatis] Registered JsonStringListTypeHandler for List<String>");
    }
}
