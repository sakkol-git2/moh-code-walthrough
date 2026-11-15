const rollbackObservation = {
  "description": "Local default-rule check using Spring 6.2.15, common_library 1.0.4 and the compiled Application validation exception. No database or service was started.",
  "output": "CustomValidationException -> rollback=true\nNotFoundException -> rollback=true\nIllegalArgumentException -> rollback=true\nException -> rollback=false\n",
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
      "path": "/Users/apple/.m2/repository/org/springframework/spring-web/6.2.15/spring-web-6.2.15.jar",
      "sha256": "bf551345ddc959ba63673ba907f6e48a0f84f52e6b60a19ac32e5fdeed5af85a"
    },
    {
      "path": "/Users/apple/.m2/repository/kh/gov/esb/common_library/1.0.4/common_library-1.0.4.jar",
      "sha256": "980bf2c43d30412485bae0b0ae1291dcf1f40d1cd0ad7f746075cc332177ff27"
    },
    {
      "path": "/Users/apple/Documents/TSC-MOH/.worktrees/dr06-application/target/classes/kh/gov/esb/application/exception/CustomValidationException.class",
      "sha256": "59581afda7d72485b53ef904f0c4b0c8e73986fd252d364aab9f51dd49ee464d"
    }
  ]
};
