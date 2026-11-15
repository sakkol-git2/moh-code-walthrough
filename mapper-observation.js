const mapperObservation = {
  "path": "/Users/apple/Documents/TSC-MOH/.worktrees/dr06-application/target/generated-sources/annotations/kh/gov/esb/application/modules/reagent/mapper/ApplicationReagentMapperImpl.java",
  "line": 99,
  "code": "    public void updateProduct(ReagentProductRequestDto dto, ApplicationReagentProduct product) {\n        if ( dto == null ) {\n            return;\n        }\n\n        product.setApplicationType( dto.getApplicationType() );\n        product.setProductName( dto.getProductName() );\n        product.setReferenceModel( dto.getReferenceModel() );\n        product.setPackSize( dto.getPackSize() );\n        product.setManufacturerName( dto.getManufacturerName() );\n        product.setManufacturerAddress( dto.getManufacturerAddress() );\n        product.setManufacturerCountry( dto.getManufacturerCountry() );\n        product.setMahName( dto.getMahName() );\n        product.setMahAddress( dto.getMahAddress() );\n    }",
  "sha256": "f36b366abd735040f9e05266f9bb708fc193b140e1c69519ddfe6c03ce13fc96",
  "provenance": "Local generated build artifact, MapStruct 1.6.3. This file is outside the Git source snapshot."
};
