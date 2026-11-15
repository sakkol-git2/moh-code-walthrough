const propagationObservation = {
  "description": "Executed with Spring 6.2.15 TransactionTemplate and AbstractPlatformTransactionManager using an in-memory diagnostic resource. This verifies propagation and callback behaviour, not JPA or a live MOH request.",
  "output": "caught inside transaction: committed=[outer-row]; outcome=returned\ncaught joined REQUIRED failure: committed=[]; outcome=UnexpectedRollbackException\nREQUIRES_NEW commits then outer fails: committed=[independent-row]; outcome=IllegalArgumentException\nREQUIRES_NEW fails and outer catches: committed=[outer-row]; outcome=returned\nafterCommit callback throws: committed=[outer-row]; outcome=IllegalArgumentException\n",
  "artifacts": [
    {
      "path": "/Users/apple/.m2/repository/org/springframework/spring-tx/6.2.15/spring-tx-6.2.15.jar",
      "sha256": "abf9afce943f18f3f76ac4fbd65897fdd99b31d5fc1616e0068319c18c525c9d"
    },
    {
      "path": "/Users/apple/.m2/repository/org/springframework/spring-core/6.2.15/spring-core-6.2.15.jar",
      "sha256": "efebed60992aef00bfb88871e8ea590428425aa42d4cdbedcb88ca3e47cf05b0"
    },
    {
      "path": "/Users/apple/.m2/repository/org/springframework/spring-jcl/6.2.15/spring-jcl-6.2.15.jar",
      "sha256": "1c32d68deec4c06957e3311d32ff0590ae03844b49e5c2e1da15424841165bcb"
    },
    {
      "path": "/Users/apple/.m2/repository/org/springframework/spring-beans/6.2.15/spring-beans-6.2.15.jar",
      "sha256": "ffba8542f6799b2afbdcbda715e185cb53bb1d497389ba2102f95088d1564c2c"
    }
  ]
};
