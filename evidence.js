const evidence = {
  "portal": {
    "repo": "MOH-Registry-Public-Portal",
    "rev": "71509533",
    "path": "app/repositories/application.ts",
    "line": 62,
    "code": "    submitApplicationById: (id: number) =>\n      apiRequest<ApiApplicationResponse>(\n        fetcher(`/applications/${id}/submit`, {\n          method: \"POST\",\n        }),\n      ),\n\n    createApplication: (payload: unknown) =>\n      apiRequest<ApiApplicationResponse>(\n        fetcher(\"/applications\", {\n          method: \"POST\",\n          body: JSON.stringify(payload),\n        }),\n      ),"
  },
  "gateway": {
    "repo": "MOH-Public-Gateway",
    "rev": "32a85fb",
    "path": "src/main/java/kh/gov/esb/public_gateway/configuration/route/ApplicationRouteConfiguration.java",
    "line": 23,
    "code": "                .route(\"application-routes\",\n                        fn -> fn.method(HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE)\n                                .and()\n                                .path(\"/api/v1/applications/**\")\n                                .filters(filterSpec -> filterSpec\n                                        .filter(tokenRequirementFilterFactory.apply(new TokenRequirementFilterFactory.Config(List.of(HeaderToken.AUTHORIZATION))))\n                                        .filter(authorizationFilter)\n                                )\n                                .uri(applicationServiceUrl)\n                )"
  },
  "http": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/controller/ApplicationController.java",
    "line": 152,
    "code": "    @PostMapping\n    @Operation(\n            summary = \"Create new application with status draft.\",\n            tags = {TAG_PUBLIC}\n    )\n    public ResponseEntity<ApiResponse<BaseApplicationResponseDto>> createApplication(@Valid @RequestBody BaseApplicationRequestDto requestDto) throws BaseException {\n        Application application = applicationService.saveApplication(null, requestDto);\n        BaseApplicationResponseDto response = applicationStrategyFactory.mapToResponseDto(application);\n        applicationAudienceDecorator.decorate(response, application, authenticationFacade.getAuth().getContext());\n        return getOkResponse(response);"
  },
  "dispatch": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 271,
    "code": "    public Application saveApplication(Long applicationId, BaseApplicationRequestDto requestDto) throws BaseException {\n        String serviceCode = requestDto.getServiceCode();\n        Application application = null;\n        if (applicationId != null) {\n            application = getApplicationById(applicationId);\n            serviceCode = application.getServiceCode();\n        } else {\n            // A switched-off service can't be started. An existing draft may still be edited; submit checks again.\n            serviceAvailabilityGate.assertOpen(serviceCode);\n        }\n        ApplicationStrategy<? super BaseApplicationRequestDto> strategy = applicationStrategyFactory.getStrategy(serviceCode);\n        Application saved = strategy.saveApplication(applicationId, requestDto, application);\n        if (requestDto.getRelationApplicationId() != null) {"
  },
  "subtype": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/dto/request/base/BaseApplicationRequestDto.java",
    "line": 183,
    "code": "        @JsonSubTypes.Type(value = ReagentRegistrationRequestDto.class, name = ServiceCode.REAGENT_LICENSE_REGISTRATION),"
  },
  "dto": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/dto/request/ReagentProductRequestDto.java",
    "line": 35,
    "code": "\n    /** Required per product on submit; drafts may leave it unset. */\n    @NotNull(groups = {SubmitValidation.class})\n    private ReagentApplicationType applicationType;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 255)"
  },
  "batch": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/dto/request/ReagentRequestDto.java",
    "line": 23,
    "code": "    /** The applicant's TR01 or TR07 establishment profile; checked on submit (same rule as DR03 and DR08). */\n    private Long prerequisiteProfileId;\n\n    @Valid\n    private List<ReagentProductRequestDto> products;\n\n    /** Reject the obsolete shared origin even when the application ObjectMapper ignores unknown fields. */\n    @JsonProperty(\"application_type\")\n    public void rejectApplicationType(Object ignored) {\n        throw new IllegalArgumentException(\"Use reagent.products[].application_type (LOCAL or IMPORT) for each product\");\n    }\n}"
  },
  "save": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 190,
    "code": "        for (int i = 0; i < products.size(); i++) {\n            ReagentProductRequestDto dto = products.get(i);\n            ApplicationReagentProduct product = dto.getId() != null\n                    ? saved.get(dto.getId())\n                    : ApplicationReagentProduct.builder().application(application).build();\n            reagentMapper.updateProduct(dto, product);\n            product.setPosition(i);\n            // Same lookup as the application's own attachments: unknown file ids are rejected and the stored\n            // name, path, size and content type are copied from the uploaded file.\n            List<AttachmentDto> resolved = attachmentResolutionService.resolve(dto.getAttachments());\n            product.setAttachments(resolved != null ? attachmentMapper.toAttachments(resolved) : null);\n            productRepository.save(product);"
  },
  "mapper": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/mapper/ApplicationReagentMapper.java",
    "line": 32,
    "code": "    @Mapping(target = \"id\", ignore = true)\n    @Mapping(target = \"application\", ignore = true)\n    @Mapping(target = \"position\", ignore = true)\n    @Mapping(target = \"attachments\", ignore = true)\n    void updateProduct(ReagentProductRequestDto dto, @MappingTarget ApplicationReagentProduct product);"
  },
  "entity": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/model/ApplicationReagentProduct.java",
    "line": 55,
    "code": "\n    /** Order in the applicant's list (0-based). */\n    @Column(name = \"position\", nullable = false)\n    private Integer position;\n\n    /** Local / Import belongs to this product, including in mixed-type batches. */\n    @Enumerated(EnumType.STRING)\n    @Column(name = \"application_type\")\n    private ReagentApplicationType applicationType;"
  },
  "rows": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/resources/db/changelogs/migrations/049-reagent-dr06-registration.sql",
    "line": 18,
    "code": "CREATE TABLE application_reagent_products (\n    id bigserial NOT NULL,\n    application_id bigint NOT NULL,\n    position integer NOT NULL,\n    application_type varchar(32),\n    product_name varchar(255),\n    reference_model varchar(255),"
  },
  "fk": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/resources/db/changelogs/migrations/049-reagent-dr06-registration.sql",
    "line": 38,
    "code": "    CONSTRAINT fk_application_reagent_products_application_id FOREIGN KEY (application_id)\n        REFERENCES applications (id) ON DELETE CASCADE,\n    CONSTRAINT ck_application_reagent_products_position CHECK (position >= 0),\n    CONSTRAINT ck_application_reagent_products_application_type CHECK (application_type IN ('LOCAL', 'IMPORT'))\n);\n\nCREATE INDEX idx_app_reagent_products_application_id_position\n    ON application_reagent_products (application_id, position);\n"
  },
  "detail": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/resources/db/changelogs/migrations/049-reagent-dr06-registration.sql",
    "line": 5,
    "code": "CREATE TABLE application_reagent_details (\n    application_id bigint NOT NULL,\n    prerequisite_profile_id bigint,\n    version integer DEFAULT 0,\n    created_date timestamp(6) with time zone,\n    updated_date timestamp(6) with time zone,\n    created_by varchar(255),\n    updated_by varchar(255),\n    CONSTRAINT pk_application_reagent_details PRIMARY KEY (application_id),\n    CONSTRAINT fk_application_reagent_details_application_id FOREIGN KEY (application_id)\n        REFERENCES applications (id) ON DELETE CASCADE\n);"
  },
  "response": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 359,
    "code": "    public BaseApplicationResponseDto mapToResponseDto(Application application) {\n        ReagentRegistrationApplicationResponseDto dto = applicationMapper.toReagentRegistrationApplicationResponseDto(application);\n        detailRepository.findByApplicationId(application.getId()).ifPresent(detail -> {\n            ReagentResponseDto reagent = reagentMapper.toResponseDto(detail);\n            reagent.setProducts(productRepository.findByApplication_IdOrderByPositionAscIdAsc(application.getId())\n                    .stream().map(reagentMapper::toProductResponseDto).toList());\n            dto.setReagent(reagent);\n        });\n        return dto;"
  },
  "validate": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 251,
    "code": "            for (int i = 0; i < products.size(); i++) {\n                ApplicationReagentProduct product = products.get(i);\n                collectViolations(reagentMapper.toProductRequestDto(product), item(i), fieldErrors);\n                validateProductAttachments(product, item(i) + \".attachments\", fieldErrors);\n            }\n            // The core document check reads the application's attachments only. Add every product's files so it\n            // does not report the product documents missing at the root.\n            requestDto.setAttachments(mergeProductAttachments(requestDto.getAttachments(), products));\n        };"
  },
  "missing": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 292,
    "code": "            missing = serviceDocumentGroupService\n                    .validateAttachmentsByServiceCode(ServiceCode.REAGENT_LICENSE_REGISTRATION,\n                            attachmentMapper.toAttachmentDtos(attachments))\n                    .getMissingAttachments().stream()\n                    .filter(item -> !SHARED_DOCUMENT_KEY.equals(item.getKey()))\n                    .toList();\n        } catch (BaseException ex) {\n            fieldErrors.putIfAbsent(errorKey, ex.getMessage());\n            return;\n        }\n        if (!missing.isEmpty()) {\n            MissingAttachmentResponseDto response = new MissingAttachmentResponseDto();\n            response.setMessage(\"required.attachments.missing\");\n            response.setItems(missing);\n            fieldErrors.putIfAbsent(errorKey, response);\n        }"
  },
  "docs": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/resources/db/changelogs/data/065-seed-dr06-reagent-registration.sql",
    "line": 34,
    "code": "    ('GDHT-RG-L', 'application_form', 'Application Form (system generated, signed)', 'ពាក្យសុំ (បង្កើតដោយប្រព័ន្ធ និងចុះហត្ថលេខា)', true, 1),\n    ('GDHT-RG-L', 'establishment_decision', 'Establishment decision (TR01 or TR07)', 'សេចក្តីសម្រេចអនុញ្ញាតបើកគ្រឹះស្ថានអាហរ័ណ នីហរ័ណឱសថ (TR01) ឬ សេចក្តីសម្រេចស្តីពីការបើកដំណើការការិយាល័យតំណាងគ្រឹះស្ថានផលិតឱសថនៅបរទេស (TR07)', true, 2),"
  },
  "payment": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 369,
    "code": "        boolean paymentRequired = application.isAwaitingPayment() || forcePaymentFirst || reviewService.isPaymentStep(applicationId);\n\n        if (paymentRequired) {\n            List<ApplicationRequestServiceDto> items = strategy.getApplicationRequestServices(application);\n\n            application.setStatus(ApplicationStatus.AWAITING_PAYMENT);\n            application.setPaymentStatus(ApplicationPaymentStatus.PENDING);\n            application.setPaymentContext(PaymentContext.SUBMISSION);\n            application = applicationRepository.saveAndFlush(application);\n\n            InvoiceResponseDto invoice = invoiceService.issueInvoice(application, items);\n\n            if (invoice.isFreeOrWaived()) {\n                return SubmitApplicationResult.submitted(application);\n            }\n\n            return SubmitApplicationResult.awaitingPayment(application, invoice);"
  },
  "review": {
    "repo": "MOH-Review",
    "rev": "5effb54",
    "path": "src/main/resources/db/changelogs/data/042-seed-dr06-reagent-registration-workflow.sql",
    "line": 19,
    "code": "CROSS JOIN (VALUES\n    (1, 'បង់ប្រាក់', 'Payment', 2, 'PAYMENT'),\n    (2, 'ការិយាល័យបញ្ជិកា', 'Bureau of Drug Regulation', 10, 'REVIEW'),\n    (3, 'នាយកដ្ឋានឱសថ ចំណីអាហារ បរិក្ខារពេទ្យ និងគ្រឿងសម្អាង', 'Department of Drugs and Food', 2, 'REVIEW'),\n    (4, 'អគ្គនាយកដ្ឋានបច្ចេកទេស', 'General Department of Technical Services', 5, 'REVIEW'),\n    (5, 'រដ្ឋលេខាធិការទទួលបន្ទុក', 'Secretary of State in charge', 7, 'REVIEW')\n) AS v (step_order, name_kh, name_en, department_unit_id, step_type)\nWHERE w.name_en = 'Reagent Product Registration'"
  },
  "approve": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 811,
    "code": "        switch (status) {\n            case APPROVED:\n                application.setStatus(ApplicationStatus.APPROVED);\n                application.setApprovedBy(payload.getUserId());\n                application.setApprovedDate(now);\n                applicationRepository.save(application);\n                applicationEventPublisher.publishEvent(new ApplicationStatusUpdatedDomainEvent(application));\n                applicationEventPublisher.publishEvent(new ApplicationApprovedDomainEvent(application));\n                applicationEventPublisher.publishEvent(new ApplicationMsmePushbackDomainEvent(application, payload.getComment(), null));"
  },
  "payload": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 397,
    "code": "        m.put(\"prerequisite_profile_id\", detail.getPrerequisiteProfileId());\n        List<Map<String, Object>> list = new ArrayList<>();\n        for (ApplicationReagentProduct p : products) {\n            Map<String, Object> pm = new HashMap<>();\n            pm.put(\"id\", p.getId());\n            pm.put(\"position\", p.getPosition());\n            pm.put(\"application_type\", p.getApplicationType() != null ? p.getApplicationType().name() : null);\n            pm.put(\"product_name\", p.getProductName());\n            pm.put(\"reference_model\", p.getReferenceModel());"
  },
  "files": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 411,
    "code": "            pm.put(\"mah_address\", p.getMahAddress());\n            pm.put(\"attachments\", p.getAttachments() != null ? attachmentMapper.toAttachmentDtos(p.getAttachments()) : List.of());\n            list.add(pm);\n        }\n        m.put(\"products\", list);\n        return m;"
  },
  "publish": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/kafka/producer/ApplicationEventProducer.java",
    "line": 166,
    "code": "        ApplicationApprovedMessage message;\n        try {\n            message = applicationStrategyFactory.toApplicationApprovedMessage(application, formData);\n        } catch (BaseException e) {\n            log.warn(\"ApplicationEventProducer > produceApplicationApprovedEvent > {}: unsupported service code\", key);\n            return;\n        }\n\n        kafkaTemplate.send(kafkaConfiguration.getApplicationApprovedTopic(), key, message);\n    }"
  },
  "consumer": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/kafka/consumer/ProfileKafkaConsumer.java",
    "line": 43,
    "code": "    @KafkaListener(topics = \"#{@kafkaConfiguration.applicationApprovedTopic}\", groupId = \"#{@kafkaConfiguration.profileGroup}\")\n    public void handleApplicationApproved(@Payload @Valid ApplicationApprovedMessage payload,\n                                          @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) throws Exception {\n        String serviceCode = payload.getService().getCode();\n        String messageId = String.valueOf(payload.getId());\n        String payloadJson = writeJson(payload);\n\n        LicenseOperationStrategy strategy;\n        try {\n            strategy = strategyFactory.getOperationStrategy(serviceCode);\n        } catch (BaseException e) {\n            log.warn(\"Unsupported service code: {}\", serviceCode);\n            return;\n        }\n\n        handleWithInbox(messageId, serviceCode + \"_APPROVED\", topic, payloadJson, null, () -> {\n            strategy.processApprovedMessage(payload);"
  },
  "license": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/strategy/handler/ReagentRegisterHandler.java",
    "line": 79,
    "code": "        for (ReagentProductDto product : products) {\n            RegulatoryRegistration registration = licenseBuilder.buildNew(\n                    LicenseBuildContext.<ReagentProductRegisterRequestDto, ReagentCertificateType>builder()\n                            .profile(profile)\n                            .item(ReagentCertificateType.REAGENT_PRODUCT_LICENSE)\n                            .operationType(LicenseOperationType.ISSUE)\n                            .requestDto(new ReagentProductRegisterRequestDto(requestDto, product))\n                            .build());\n            regulatoryRegistrationService.save(registration);\n            profile.addRegistration(registration);\n\n            ReagentProductLicenseDetail detail = mapper.toDetail(requestDto, product);\n            detail.setProfile(profile);\n            detail.setRegistration(registration);\n            ctx.getDetails().getDetails().add(detailRepository.save(detail));"
  },
  "origin": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/dto/operation/ReagentProductRegisterRequestDto.java",
    "line": 21,
    "code": "    @Override\n    public ProductOrigin productOrigin() {\n        return switch (product.getApplicationType()) {\n            case LOCAL -> ProductOrigin.LOCAL;\n            case IMPORT -> ProductOrigin.IMPORT;\n        };"
  },
  "cert": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/strategy/handler/ReagentRegisterHandler.java",
    "line": 112,
    "code": "        List<License> licenses = registrations.stream().map(RegulatoryRegistration::getLicense).toList();\n        certificatePublishStrategy.publishCertificateOperationEvent(\n                LicenseOperationType.ISSUE, profile, requestDto.getServiceCode(), licenses);\n    }"
  },
  "quantity": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 337,
    "code": "    /** One billable unit per saved product: 400,000 riel each. No products, no invoice. */\n    @Override\n    public List<ApplicationRequestServiceDto> getApplicationRequestServices(Application application) throws BaseException {\n        long count = productRepository.countByApplication_Id(application.getId());\n        if (count < 1) {\n            // Existing message key: no products, nothing to bill (DR08 would bill one unit for an empty list).\n            throw new BaseException(\"field.must.not.be.empty\", HttpStatus.UNPROCESSABLE_ENTITY.value());\n        }\n        return List.of(ApplicationRequestServiceDto.builder()\n                .serviceCode(ServiceCode.REAGENT_LICENSE_REGISTRATION)\n                .quantity((int) count)\n                .build());"
  },
  "submit": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/controller/ApplicationController.java",
    "line": 176,
    "code": "    @PostMapping(\"/{id}/submit\")\n    @Operation(\n            summary = \"Submit application for review\",\n            tags = {TAG_PUBLIC}\n    )\n    public ResponseEntity<SubmitApplicationResponseDto> submitApplication(@PathVariable(\"id\") Long applicationId) throws BaseException {\n        SubmitApplicationResult result = applicationService.submitApplication(applicationId);\n        Application application = result.getApplication();\n        BaseApplicationResponseDto response = applicationStrategyFactory.mapToResponseDto(application);\n        applicationAudienceDecorator.decorate(response, application, authenticationFacade.getAuth().getContext());\n        return ResponseEntity.ok(SubmitApplicationResponseDto.of(response, result));"
  },
  "paidSend": {
    "repo": "MOH-Payment",
    "rev": "9211972",
    "path": "src/main/java/kh/gov/esb/payment/kafka/PaymentKafkaProducer.java",
    "line": 24,
    "code": "    public void sendPaymentCompletedMessage(PaymentCompletedMessage message) {\n        log.info(\"Sending PaymentCompletedMessage: {}\", message);\n        kafkaTemplate.send(kafkaConfiguration.getPaymentCompletedTopic(), message);\n    }"
  },
  "paidRead": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/kafka/consumer/PaymentEventConsumer.java",
    "line": 17,
    "code": "    @KafkaListener(topics = \"#{kafkaConfiguration.getPaymentCompletedTopic()}\", groupId = \"#{kafkaConfiguration.getKafkaGroup()}\")\n    public void handlePaymentCompleted(PaymentCompletedMessage payload) throws BaseException {\n        log.info(\"handlePaymentCompleted > received message: {}\", payload);\n        applicationService.handleApplicationPaid(payload);\n    }"
  },
  "settle": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 765,
    "code": "            switch (paymentContext) {\n                case SUBMISSION -> {\n                    ApplicationStrategy strategy = applicationStrategyFactory.getStrategy(application.getServiceCode());\n                    finalizeSubmission(application, strategy);\n                }"
  },
  "finalize": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 448,
    "code": "        application.setStatus(submittedStatus);\n        application = applicationRepository.save(application);\n        strategy.sendNotifications(application, ApplicationStrategyAction.SUBMIT);\n        return SubmitApplicationResult.submitted(application);"
  },
  "submitted": {
    "repo": "MOH-Review",
    "rev": "5effb54",
    "path": "src/main/java/kh/gov/esb/review/kafka/ReviewKafkaConsumer.java",
    "line": 80,
    "code": "    @KafkaListener(topics = \"#{@kafkaConfiguration.applicationSubmittedTopic}\", groupId = \"#{@kafkaConfiguration.reviewGroup}\")\n    public void reviewRequestCreatedTopicListener(@Payload @Valid ApplicationSubmittedMessage applicationSubmittedMessage) throws BaseException {\n        log.info(\"ReviewRequestCreatedMessage: {}\", applicationSubmittedMessage);\n        try {\n            reviewApprovalRequestService.update(applicationSubmittedMessage);\n        } catch (NotFoundException | BadRequestException | ForbiddenException e) {"
  },
  "finalApproval": {
    "repo": "MOH-Review",
    "rev": "5effb54",
    "path": "src/main/java/kh/gov/esb/review/service/ApprovalServiceImpl.java",
    "line": 120,
    "code": "            stepRequirementEngine.validate(request, requirement);\n        }\n\n        approvalHelper.saveAction(request, currentStep, currentStep, ApprovalStatus.APPROVED, authenticationFacade.getAuth().getUserId(), null, ReviewActionType.APPROVE, null);\n        approvalHelper.updateRequestStatus(request, ApprovalStatus.APPROVED);\n        return ApproveResponseDto.builder().requestId(request.getId()).status(ApprovalStatus.APPROVED.name()).build();"
  },
  "reviewSend": {
    "repo": "MOH-Review",
    "rev": "5effb54",
    "path": "src/main/java/kh/gov/esb/review/kafka/ReviewKafkaProducer.java",
    "line": 34,
    "code": "    public void sendReviewRequestCreatedMessage(ReviewRequestCreatedMessage message) {\n        log.info(\"Sending ReviewRequestCreatedMessage: {}\", message);\n        kafkaTemplate.send(kafkaConfiguration.getReviewRequestCreatedTopic(), String.valueOf(message.getApplicationId()), message);\n    }\n"
  },
  "reviewRead": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/kafka/consumer/ReviewEventConsumer.java",
    "line": 16,
    "code": "    @KafkaListener(topics = \"#{kafkaConfiguration.getReviewRequestCreatedTopic()}\", groupId = \"#{kafkaConfiguration.getKafkaGroup()}\")\n    public void handleApplicationReviewCreated(ReviewRequestCreatedMessage payload) {\n        applicationService.handleApplicationReviewCreated(payload);\n    }\n}"
  },
  "messageKey": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/kafka/producer/ApplicationEventProducer.java",
    "line": 158,
    "code": "    public void produceApplicationApprovedEvent(ApplicationApprovedDomainEvent domainEvent) {\n        Application application = domainEvent.getApplication();\n        String key = application.getApplicationNo();\n        String serviceCode = application.getServiceCode();\n        log.info(\"ApplicationEventProducer > produceApplicationApprovedEvent > {}: {}\", serviceCode, key);\n\n        String formData = buildFormData(application);\n"
  },
  "replay": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/strategy/handler/ReagentRegisterHandler.java",
    "line": 57,
    "code": "    public void handle(ReagentRegisterRequestDto requestDto) throws NotFoundException {\n        if (detailRepository.existsBySourceApplicationId(requestDto.getApplicationId())) {\n            log.info(\"[GDHT-RG-L] Approval for application {} ({}) was already processed; replay ignored\",\n                    requestDto.getApplicationId(), requestDto.getApplicationNo());\n            return;\n        }\n        registerHandler.handle(requestDto, this);\n    }"
  },
  "snapshot": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/mapper/ReagentMapper.java",
    "line": 142,
    "code": "    public ReagentProductLicenseDetail toDetail(ReagentRegisterRequestDto request, ReagentProductDto product) {\n        return ReagentProductLicenseDetail.builder()\n                .sourceApplicationId(request.getApplicationId())\n                .sourceApplicationNo(request.getApplicationNo())\n                .sourceProductId(product.getId())\n                .prerequisiteProfileId(request.getPrerequisiteProfileId())\n                .position(product.getPosition())\n                .applicationType(product.getApplicationType())\n                .productName(product.getProductName())\n                .referenceModel(product.getReferenceModel())\n                .packSize(product.getPackSize())\n                .manufacturerName(product.getManufacturerName())\n                .manufacturerAddress(product.getManufacturerAddress())\n                .manufacturerCountry(product.getManufacturerCountry())\n                .mahName(product.getMahName())\n                .mahAddress(product.getMahAddress())\n                .attachments(copyAttachments(product.getAttachments()))\n                .sharedAttachments(copyAttachments(request.getSharedAttachments()))\n                .build();"
  },
  "certMatch": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/strategy/ReagentCertificatePublishStrategy.java",
    "line": 47,
    "code": "                                                                String serviceCode, List<License> licenses) {\n        Map<Long, ReagentProductLicenseDetail> byLicenseId = detailRepository\n                .findAllByLicenseIdIn(licenses.stream().map(License::getId).toList())\n                .stream()\n                .collect(Collectors.toMap(d -> d.getRegistration().getLicense().getId(), Function.identity()));\n        List<ReagentProductLicenseDetail> details = licenses.stream()\n                .map(l -> byLicenseId.get(l.getId()))\n                .collect(Collectors.toCollection(java.util.ArrayList::new));\n        return mapper.toCertificateRequests(profile, licenses, details, operationType);\n    }"
  },
  "certData": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/mapper/ReagentMapper.java",
    "line": 234,
    "code": "        Map<String, Object> data = ProfileCertificateDataBuilder.builder()\n                .addCertificateNo(license.getLicenseNo())\n                .addRegisterNumber(license.getLicenseReferenceNo())\n                .addApplicationNo(license.getApplicationNo())\n                .addDates(license.getIssueDate() != null ? license.getIssueDate().toString() : null,\n                        license.getExpiryDate() != null ? license.getExpiryDate().toString() : null)\n                .build();\n        if (d != null) {\n            // Proposed keys (DR06 U3); no Certificate template is changed by this module.\n            data.put(\"applicationType\", d.getApplicationType() != null ? d.getApplicationType().name() : null);\n            data.put(\"productName\", d.getProductName());\n            data.put(\"referenceModel\", d.getReferenceModel());\n            data.put(\"packSize\", d.getPackSize());"
  },
  "pending": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/AbstractCertificatePublishStrategy.java",
    "line": 62,
    "code": "        Map<String, Object> payload = objectMapper.convertValue(\n                Map.of(\"certificate_requests\", certificateRequests, \"verify_requests\", verifyRequests),\n                new TypeReference<>() {\n                }\n        );\n\n        licenses.forEach(l -> l.setCertificateStatus(CertificateStatus.PENDING));\n        licenseRepository.saveAll(licenses);"
  },
  "operation": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/kafka/producer/ProfileKafkaProducer.java",
    "line": 118,
    "code": "    public void produceProfileLicenseOperationEvent(ProfileLicenseOperationEvent domainEvent) {\n        log.info(\"ProfileLicenseOperationEvent: {}\", domainEvent);\n        ProfileLicenseOperationMessage message = profileMapper.toProfileLicenseOperationMessage(domainEvent, serviceName);\n        publishWithOutbox(String.valueOf(domainEvent.profileId()), \"PROFILE_LICENSE_OPERATION\",\n                kafkaConfiguration.getProfileLicenseOperationTopic(), message);\n    }"
  },
  "certRead": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/kafka/consumer/CertificateKafkaConsumer.java",
    "line": 39,
    "code": "            List<Map<String, Object>> requests = payloadExtractor.extractCertificateRequests(event);\n            List<Map<String, Object>> verifyRequests = payloadExtractor.extractVerifyRequests(event);\n\n            for (int i = 0; i < requests.size(); i++) {\n                Map<String, Object> requestData = requests.get(i);\n                Map<String, Object> verifyRequest = (verifyRequests != null && i < verifyRequests.size())\n                        ? verifyRequests.get(i)\n                        : null;\n                certificateAsyncService.processOperation(\n                        operationId,\n                        event.getOperationType(),\n                        requestData,\n                        event.getServiceCode(),\n                        verifyRequest);"
  },
  "issue": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/service/CertificateAsyncService.java",
    "line": 51,
    "code": "    private Mono<Void> buildOperationMono(String operation, Map<String, Object> requestData,\n                                          String serviceCode, Map<String, Object> verifyData) {\n        return switch (operation) {\n            case \"ISSUE\", \"CREATE\" -> certificateService.create(requestData, verifyData, serviceCode);\n            case \"RENEW\" -> certificateService.renew(requestData, verifyData, serviceCode);"
  },
  "template": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/service/CertificateServiceImpl.java",
    "line": 490,
    "code": "        return certificateTemplateRepository\n                .findByServiceCodeAndTemplateTypeAndStatus(serviceCode, templateType, RecordStatus.ACTIVE)\n                .orElseThrow(() -> new BaseException(\n                        \"No active certificate template found for serviceCode=\" + serviceCode\n                                + \", templateType=\" + templateType,\n                        HttpStatus.UNPROCESSABLE_ENTITY.value()));"
  },
  "pdf": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/utility/MapCertificateProcessor.java",
    "line": 72,
    "code": "                    return qrMono.defaultIfEmpty(\"\")\n                            .flatMap(qrCode -> selectRenderer(template)\n                                    .render(certificateData, template, qrCode.isBlank() ? null : qrCode))\n                            .flatMap(pdfBytes -> {\n                                String fileName = generateFileName(template.getServiceCode());\n                                return Mono.fromCallable(() -> fileStorageService.uploadCertificate(pdfBytes, fileName))\n                                        .subscribeOn(Schedulers.boundedElastic())\n                                        .flatMap(response ->\n                                                Mono.fromRunnable(() ->\n                                                                updateCertificateAfterCreate(certId, response, fileName, pdfBytes.length, requestData, reason))\n                                                        .subscribeOn(Schedulers.boundedElastic())\n                                        );"
  },
  "pdfRecord": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/utility/MapCertificateProcessor.java",
    "line": 199,
    "code": "        cert.setFileName(fileName);\n        cert.setObjectName(response.object());\n        cert.setFileETag(response.etag());\n        cert.setContentLength(fileSize);\n        cert.setContentType(\"application/pdf\");\n        cert.setIssuedDate(getString(requestData, \"issued_date\"));\n        cert.setExpiredDate(getString(requestData, \"expired_date\"));\n        cert.setStatus(CertificateStatus.ENABLE);"
  },
  "certResult": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/service/CertificateAsyncService.java",
    "line": 27,
    "code": "        buildOperationMono(operation, requestData, serviceCode, verifyData)\n                .thenReturn(0)\n                .onErrorReturn(500)\n                .doOnNext(errorCode ->\n                        certificateEventProducer.publishOperationResult(\n                                operationId,\n                                operation,\n                                getLong(requestData, \"license_id\"),\n                                getString(requestData, \"license_no\"),\n                                serviceCode,\n                                getLong(requestData, \"profile_id\"),\n                                getString(requestData, \"profile_no\"),\n                                resolveUserId(getString(requestData, \"user_id\")),\n                                errorCode,\n                                errorCode == 0 ? resolveSuccessMessage(operation) : \"Failed to process operation\""
  },
  "profileKeys": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/resources/db/changelogs/migrations/020-reagent-dr06-product-license-details.sql",
    "line": 29,
    "code": "    CONSTRAINT pk_reagent_product_license_details PRIMARY KEY (registration_id),\n    CONSTRAINT fk_reagent_prod_lic_dtl_registration_id FOREIGN KEY (registration_id) REFERENCES regulatory_registrations (registration_id),\n    CONSTRAINT fk_reagent_prod_lic_dtl_profile_id FOREIGN KEY (profile_id) REFERENCES profiles (id),\n    CONSTRAINT ck_reagent_prod_lic_dtl_source_product_id CHECK (source_product_id > 0),\n    CONSTRAINT ck_reagent_prod_lic_dtl_position CHECK (position IS NULL OR position >= 0),\n    CONSTRAINT uk_reagent_prod_lic_dtl_source_app_position UNIQUE (source_application_id, position),\n    CONSTRAINT uk_reagent_prod_lic_dtl_source_app_product UNIQUE (source_application_id, source_product_id),\n    CONSTRAINT ck_reagent_prod_lic_dtl_application_type CHECK (application_type IN ('LOCAL', 'IMPORT'))"
  },
  "licenseJoin": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/registration/model/RegulatoryRegistration.java",
    "line": 68,
    "code": "\n    @OneToOne(fetch = FetchType.LAZY, optional = false, cascade = CascadeType.ALL)\n    @JoinColumn(name = \"license_id\", referencedColumnName = \"id\", unique = true, nullable = false)\n    private License license;\n\n    @Column(name = \"license_no\")\n    private String licenseNo;\n\n    @ManyToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = \"profile_id\", referencedColumnName = \"id\")\n    private Profile profile;"
  },
  "certificateKey": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/model/Certificate.java",
    "line": 56,
    "code": "    @Id\n    @GeneratedValue(strategy = GenerationType.UUID)\n    @Column(name = \"id\")\n    private UUID id;\n\n    @Column(name = \"profile_id\")\n    private Long profileId;\n\n    @Column(name = \"license_id\", nullable = false)\n    private Long licenseId;"
  },
  "draftParent": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/handler/ApplicationCoreHandler.java",
    "line": 163,
    "code": "        List<Long> licenseIds = application.getLicenseIds();\n        if (licenseIds != null && !licenseIds.isEmpty()) {\n            application.setApplicationProfileLicenseId(licenseIds.get(0));\n        }\n        return applicationRepository.save(application);\n    }"
  },
  "draftDetail": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 144,
    "code": "    private void saveDetail(Application application, ReagentRequestDto dto) {\n        ApplicationReagentDetail detail = detailRepository.findByApplicationId(application.getId())\n                .orElseGet(() -> ApplicationReagentDetail.builder().application(application).build());\n        detail.setPrerequisiteProfileId(dto.getPrerequisiteProfileId());\n        detailRepository.save(detail);\n    }"
  },
  "newLicence": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/builder/BaseLicenseBuilder.java",
    "line": 26,
    "code": "    public RegulatoryRegistration buildNew(LicenseBuildContext<T, I> ctx) {\n        RegulatoryRegistration registration = new RegulatoryRegistration();\n        registration.setLicense(new License());\n        applyCommonFields(registration, ctx);\n        applyIssueDateFields(registration, ctx);\n        applyServiceFields(registration, ctx);\n        return registration;\n    }\n"
  },
  "coreProfileFK": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/resources/db/changelogs/migrations/001-initial-schema.sql",
    "line": 915,
    "code": "ALTER TABLE regulatory_registrations ADD CONSTRAINT fk_regulatory_registrations_license_id FOREIGN KEY (license_id) REFERENCES licenses;\nALTER TABLE regulatory_registrations ADD CONSTRAINT fk_regulatory_registrations_profile_id FOREIGN KEY (profile_id) REFERENCES profiles;"
  },
  "coreLicenceFK": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/resources/db/changelogs/migrations/001-initial-schema.sql",
    "line": 895,
    "code": "ALTER TABLE licenses ADD CONSTRAINT fk_licenses_profile_id FOREIGN KEY (profile_id) REFERENCES profiles;"
  },
  "initialCert": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/utility/MapCertificateProcessor.java",
    "line": 171,
    "code": "    protected UUID createCertificateEntity(Map<String, Object> requestData, CertificateTemplate template) {\n        return certificateRepository.upsertCertificateMinimal(\n                getLong(requestData, \"profile_id\"),\n                getLong(requestData, \"license_id\"),\n                getString(requestData, \"user_id\"),\n                template.getServiceCode(),\n                template.getTemplateType(),\n                template.getId()\n        );\n    }"
  },
  "invoiceCall": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/invoice/service/InvoiceServiceImpl.java",
    "line": 69,
    "code": "            record.headers().add(KafkaHeaders.CORRELATION_ID, UUID.randomUUID().toString().getBytes());\n            record.headers().add(KafkaHeaders.REPLY_TOPIC, kafkaConfiguration.getIssueInvoiceReplyTopic().getBytes());\n\n            ConsumerRecord<String, Object> response = replyingKafkaTemplate.sendAndReceive(record).get(10, TimeUnit.SECONDS);\n\n            IssueInvoiceReplyMessage replyMessage = (IssueInvoiceReplyMessage) response.value();\n\n            if (replyMessage.getError() != 0) {\n                throw new BaseException(replyMessage.getErrorMessage(), replyMessage.getError());\n            }\n\n            InvoiceResponseDto invoiceResponseDto = invoiceMapper.fromIssueInvoiceReplyMessage(replyMessage);"
  },
  "invoiceWrite": {
    "repo": "MOH-Payment",
    "rev": "9211972",
    "path": "src/main/java/kh/gov/esb/payment/service/InvoiceServiceImpl.java",
    "line": 421,
    "code": "\n            BigDecimal totalAmount = priced.total();\n            invoice.setAmount(totalAmount);\n            if (invoice.getInvoiceNo() == null) {\n                invoice.setInvoiceNo(generateUniqueInvoiceNo());\n            }\n            invoiceRepository.save(invoice);\n\n            if (totalAmount.compareTo(BigDecimal.ZERO) == 0) {\n                paymentProcessingHelper.autoSettleWaivedInvoice(invoice);\n            }\n\n            log.info(\"Invoice ready: id={}, invoiceNo={}\", invoice.getId(), invoice.getInvoiceNo());\n\n            issueInvoiceReplyMessage = invoiceMessageMapper.toIssueInvoiceReplyMessage(invoice, invoice.getUpdatedAt().toString(), kafkaConfiguration.getServiceName(), appId, 0, \"Success\");"
  },
  "invoiceReply": {
    "repo": "MOH-Payment",
    "rev": "9211972",
    "path": "src/main/java/kh/gov/esb/payment/service/InvoiceServiceImpl.java",
    "line": 444,
    "code": "        ProducerRecord<String, Object> record = kafkaHelper.getReplyProducerRecord(kafkaConfiguration.getIssueInvoiceReplyTopic(), String.valueOf(issueInvoiceMessage.getAppId()), issueInvoiceReplyMessage, correlationId);\n\n        kafkaTemplate.send(record);"
  },
  "submitReply": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/dto/response/SubmitApplicationResponseDto.java",
    "line": 18,
    "code": "    public static SubmitApplicationResponseDto of(BaseApplicationResponseDto applicationDto, SubmitApplicationResult result) {\n        SubmitApplicationResponseDto response = new SubmitApplicationResponseDto();\n        response.setData(applicationDto);\n        response.setMetadata(\n                new Metadata(\n                        result.getStatus() == SubmitApplicationResult.Status.AWAITING_PAYMENT ? InvoicePreviewResponseDto.NextAction.PAY : InvoicePreviewResponseDto.NextAction.SUBMIT,\n                        result.getStatus(),\n                        result.getInvoice()\n                )\n        );"
  },
  "markPaid": {
    "repo": "MOH-Payment",
    "rev": "9211972",
    "path": "src/main/java/kh/gov/esb/payment/helper/PaymentProcessingHelper.java",
    "line": 104,
    "code": "    public void markInvoicePaidAndEmit(PaymentInvoice invoice) {\n        if (invoice.isPaymentSettled()) return;\n\n        Instant now = Instant.now();\n        if (invoiceRepo.markPaidIfNotSettled(invoice.getId(), now) == 0) {\n            log.info(\"invoice {} was already settled by a concurrent call, skipping duplicate emit\", invoice.getInvoiceNo());\n            return;\n        }\n        invoice.setStatus(PaymentStatus.PAID);\n        invoice.setPaidAt(now);\n        invoice.setUpdatedAt(now);\n\n        if (invoice.getAppId() == null) {\n            // A portal invoice paid before its application exists: every settlement event names the application,\n            // so they are emitted by emitSettlementEvents once the invoice is bound to it.\n            log.info(\"invoice {} marked PAID; events wait until it is bound to an application\", invoice.getInvoiceNo());\n            return;\n        }\n        emitSettlementEvents(invoice);\n    }"
  },
  "afterPaid": {
    "repo": "MOH-Payment",
    "rev": "9211972",
    "path": "src/main/java/kh/gov/esb/payment/helper/PaymentProcessingHelper.java",
    "line": 328,
    "code": "    private void emitPaymentCompletedEvent(PaymentInvoice invoice, List<InvoiceItemMessage> items) {\n        PaymentCompletedMessage message = invoiceMapper.toPaymentCompletedMessage(invoice);\n        message.setInvoiceItems(items);\n        sendAfterCommit(() -> producer.sendPaymentCompletedMessage(message));\n    }\n\n    private void sendAfterCommit(Runnable sendAction) {\n        if (TransactionSynchronizationManager.isSynchronizationActive()) {\n            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {\n                @Override\n                public void afterCommit() {\n                    sendAction.run();\n                }\n            });"
  },
  "matchPaid": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 725,
    "code": "    public void handleApplicationPaid(PaymentCompletedMessage payload) {\n        log.info(\"handleApplicationPaid > received message: {}\", payload);\n        updatePaymentStatus(payload.getAppId(), payload.getInvoiceStatus());\n    }\n\n    @Transactional\n    @Override\n    public void updatePaymentStatus(Long applicationId, String invoiceStatus) {\n        Application application = applicationRepository.findById(applicationId).orElse(null);\n\n        if (application == null) return;\n        if (application.isPaymentSettled()) {\n            log.info(\"updatePaymentStatus > This application has already been settled.\");\n            return;"
  },
  "reviewRoute": {
    "repo": "MOH-Review",
    "rev": "5effb54",
    "path": "src/main/java/kh/gov/esb/review/service/ReviewApprovalRequestServiceImpl.java",
    "line": 291,
    "code": "        boolean paymentAlreadySettled = ReviewWorkflowStepType.PAYMENT.name().equals(firstStep.getStepType())\n                && savedRequest.getPaymentStatus() == PaymentStatus.PAID;\n\n        if (paymentAlreadySettled) {\n            log.info(\"Payment already completed for appId={}, auto-transferring past PAYMENT step\", savedRequest.getAppId());\n            ReviewWorkflowStep nextStep = approvalHelper.getNextStep(savedRequest, firstStep);\n            String nextStepReviewerId = approvalHelper.resolveAutoAssignUserId(nextStep);\n            savedRequest.setLockedBy(nextStepReviewerId);\n            approvalHelper.saveAction(savedRequest, firstStep, nextStep, ApprovalStatus.IN_REVIEW, actorId, \"Payment already completed\", ReviewActionType.SYSTEM_TRANSFER, nextStepReviewerId);\n            approvalHelper.updateRequestStatus(savedRequest, ApprovalStatus.IN_REVIEW);\n            // saveAction() above already notified the officers (as SYSTEM_TRANSFER); the applicant"
  },
  "reviewSubmit": {
    "repo": "MOH-Review",
    "rev": "5effb54",
    "path": "src/main/java/kh/gov/esb/review/service/ReviewApprovalRequestServiceImpl.java",
    "line": 283,
    "code": "        savedRequest.setLockedBy(firstStepReviewerId);\n\n        ActorSnapshot submitSnapshot = approvalHelper.buildActorSnapshot(actorId, null, firstStep, ReviewActionType.SUBMIT_APPLICATION, null,\n                applicationSubmittedMessage.getActorNameEn(), applicationSubmittedMessage.getActorNameKh());\n        ReviewApprovalAction reviewApprovalAction = ReviewApprovalAction.builder().request(savedRequest).fromStep(null).toStep(firstStep).status(ApprovalStatus.SUBMITTED).actionType(ReviewActionType.SUBMIT_APPLICATION).actorId(actorId).actorSnapshot(submitSnapshot).build();\n\n        reviewApprovalActionRepository.save(reviewApprovalAction);"
  },
  "reviewStart": {
    "repo": "MOH-Review",
    "rev": "5effb54",
    "path": "src/main/java/kh/gov/esb/review/service/ApprovalServiceImpl.java",
    "line": 87,
    "code": "        ReviewWorkflowStep currentStep = approvalHelper.getCurrentStep(request);\n        String userId = authenticationFacade.getAuth().getUserId();\n\n        approvalHelper.validateActionAllowed(request, currentStep, ReviewActionPermission.START_REVIEW, true);\n\n        approvalHelper.saveAction(request, currentStep, currentStep, ApprovalStatus.IN_REVIEW, userId, null, ReviewActionType.START_REVIEW, userId);\n\n        request.setLockedBy(userId);\n        approvalHelper.updateRequestStatus(request, ApprovalStatus.IN_REVIEW);\n"
  },
  "reviewTransfer": {
    "repo": "MOH-Review",
    "rev": "5effb54",
    "path": "src/main/java/kh/gov/esb/review/service/ApprovalServiceImpl.java",
    "line": 189,
    "code": "        }\n\n        approvalHelper.saveAction(request, currentStep, nextStep, ApprovalStatus.IN_REVIEW, authenticationFacade.getAuth().getUserId(), dto.getComment(), ReviewActionType.TRANSFER_TO_NEXT_STEP, dto.getTargetUserId());\n\n        request.setLockedBy(dto.getTargetUserId());\n        // request.setCurrentStepData(null);\n        approvalHelper.updateRequestStatus(request, ApprovalStatus.IN_REVIEW);\n"
  },
  "actionWrite": {
    "repo": "MOH-Review",
    "rev": "5effb54",
    "path": "src/main/java/kh/gov/esb/review/helper/ApprovalHelper.java",
    "line": 285,
    "code": "\n    private ReviewApprovalAction persistAction(ReviewApprovalRequest request, ReviewWorkflowStep from, ReviewWorkflowStep to, ApprovalStatus status, String actorId, String comment, ReviewActionType actionType, JsonNode stepData, String targetUserId) {\n        ActorSnapshot snapshot = buildActorSnapshot(actorId, from, to, actionType, targetUserId);\n        var action = ReviewApprovalAction.builder().request(request).fromStep(from).toStep(to).stepData(stepData).actorSnapshot(snapshot).status(status).actorId(actorId).assigneeId(targetUserId).comment(comment).actionType(actionType).build();\n\n        ReviewApprovalAction saved = reviewApprovalActionRepository.save(action);\n        if (actionType != ReviewActionType.SYSTEM_TRANSFER && actionType != ReviewActionType.START_REVIEW) {\n            linkAttachments(Long.valueOf(request.getAppId()), actorId, saved);\n        }\n        return saved;"
  },
  "actionSend": {
    "repo": "MOH-Review",
    "rev": "5effb54",
    "path": "src/main/java/kh/gov/esb/review/helper/ApprovalHelper.java",
    "line": 110,
    "code": "        ReviewApprovalAction savedAction = persistAction(request, from, to, status, actorId, comment, actionType, stepData, targetUserId);\n        List<String> reviewerIds = resolveReviewerIds(to, actionType);\n        publishActionEvent(buildActionMessage(request, from, to, status, actionType, actorId, comment, reviewerIds, targetUserId));\n        List<String> officers = Optional.ofNullable(targetUserId).map(List::of).orElse(reviewerIds);\n        publishNotificationEvent(request, from, to, actionType, comment, previousStatus, status, actorId, officers);\n        return savedAction;"
  },
  "appReview": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 847,
    "code": "            case RETURNED:\n            case IN_REVIEW:\n                if (payload.getPaymentRequired() && !application.isPaymentSettled()) {\n                    handlePaymentRequired(application);\n                } else {\n                    boolean reviewerEngaged = payload.getActionType() == ActionType.START_REVIEW || reviewerAlreadyEngaged;\n                    application.setStatus(reviewerEngaged ? ApplicationStatus.REVIEW : ApplicationStatus.SUBMITTED);\n                    applicationRepository.save(application);\n                    applicationEventPublisher.publishEvent(new ApplicationMsmePushbackDomainEvent(application, payload.getComment(), null));\n                }\n                applicationEventPublisher.publishEvent(new ApplicationStatusUpdatedDomainEvent(application));"
  },
  "identityDto": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/dto/request/ReagentProductRequestDto.java",
    "line": 23,
    "code": "\n    /**\n     * Server-assigned identity. Omit it for a new product; send it back unchanged to update that product.\n     * An id that does not belong to this application is rejected.\n     */\n    private Long id;\n\n    /** Reject stale UUID-based PUTs rather than treating existing products as newly added items. */\n    @com.fasterxml.jackson.annotation.JsonProperty(\"item_id\")\n    public void rejectItemId(Object ignored) {\n        throw new IllegalArgumentException(\"Use the existing numeric products[].id, not item_id\");\n    }\n"
  },
  "attachmentDto": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/attachment/dto/AttachmentDto.java",
    "line": 12,
    "code": "@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)\npublic class AttachmentDto {\n    @UUID\n    private String id;\n\n    @NotNull\n    @NotBlank\n    private String key;\n\n    private String name;\n\n    @JsonAlias({\"fileName\", \"file_name\"})\n    private String fileName;\n    private String path;\n    private Long size;\n\n    @JsonAlias({\"contentType\", \"content_type\"})\n    private String contentType;"
  },
  "inboxBypass": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/kafka/consumer/ProfileKafkaConsumer.java",
    "line": 86,
    "code": "    private void handleWithInbox(String messageId, String eventType, String topic,\n                                 String payload, String metadata, MessageProcessor processor) throws Exception {\n        processor.process();\n\n        // TODO: Temporary ignore inbox handling\n//        if (!inboxService.receive(messageId, eventType, topic, payload, metadata)) return;\n//        try {\n//            processor.process();\n//            inboxService.markProcessed(messageId);\n//        } catch (Exception e) {\n//            inboxService.markFailed(messageId, e.getMessage());\n//            throw e;\n//        }\n    }"
  },
  "certGuard": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/kafka/consumer/CertificateKafkaConsumer.java",
    "line": 31,
    "code": "        UUID operationId = UUID.fromString(event.getOperationId());\n\n        try {\n            if (!processedOperationRepository.tryInsert(UUID.fromString(event.getOperationId()), event.getOperationType())) {\n                log.warn(\"Operation already processed: operationId={}\", event.getOperationId());\n                return;\n            }\n\n            List<Map<String, Object>> requests = payloadExtractor.extractCertificateRequests(event);"
  },
  "guardInsert": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/repository/ProcessedOperationRepository.java",
    "line": 16,
    "code": "    @Transactional\n    @Modifying\n    @Query(value = \"INSERT INTO processed_operation (operation_id, operation_type, processed_at) \" +\n            \"VALUES (:operationId, :operationType, CURRENT_TIMESTAMP) \" +\n            \"ON CONFLICT (operation_id) DO NOTHING\",\n            nativeQuery = true)\n    int tryInsertNative(@Param(\"operationId\") UUID operationId,\n                        @Param(\"operationType\") String operationType);\n\n    @Transactional\n    default boolean tryInsert(UUID operationId, String operationType) {\n        int rowsInserted = tryInsertNative(operationId, operationType);\n        return rowsInserted > 0;\n    }"
  },
  "profileTx": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/handler/BaseRegisterHandler.java",
    "line": 71,
    "code": "    @Transactional\n    public <T extends RegisterRequestDto, D> void handle(T requestDto, RegisterHandlerHooks<T, D> hooks) throws NotFoundException {\n        LicenseRegistrationContext<D> ctx = LicenseRegistrationContext.<D>builder()\n                .applicationId(requestDto.getApplicationId())\n                .applicationNo(requestDto.getApplicationNo())\n                .applicationSubmittedDate(requestDto.getApplicationSubmittedDate())\n                .applicationFirstSubmittedDate(requestDto.getApplicationFirstSubmittedDate())\n                .serviceCode(requestDto.getServiceCode())\n                .details(hooks.initDetails(requestDto))\n                .build();\n"
  },
  "profileTxEnd": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/handler/BaseRegisterHandler.java",
    "line": 98,
    "code": "        captureOperationTypes(ctx);\n        ctx.setProfile(profileRepository.saveAndFlush(ctx.getProfile()));\n        captureChangedRegistrations(ctx);\n        regulatoryRegistrationService.syncAll(ctx.getChangedRegistrations());\n        hooks.publishEvents(ctx, requestDto);\n    }"
  },
  "originContract": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/mapper/ReagentMapper.java",
    "line": 91,
    "code": "                throw new IllegalArgumentException(\"DR06 approved message \" + message.getId() + \" has a null product\");\n            }\n            if (product.getApplicationType() == null) {\n                throw new IllegalArgumentException(\"DR06 approved message \" + message.getId()\n                        + \" has no application_type for item \" + product.getId());\n            }\n            if (product.getId() == null || product.getId() <= 0 || !productIds.add(product.getId())) {\n                throw new IllegalArgumentException(\"DR06 approved message \" + message.getId()\n                        + \" has a product with a missing, invalid or repeated numeric id\");\n            }\n            if (product.getPosition() == null || product.getPosition() < 0 || !positions.add(product.getPosition())) {\n                throw new IllegalArgumentException(\"DR06 product has missing, negative or repeated position\");\n            }\n        }"
  },
  "registrationEntry": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/strategy/ReagentLicenseRegistrationStrategy.java",
    "line": 33,
    "code": "    @Override\n    public void processApprovedMessage(ApplicationApprovedMessage message) throws BaseException {\n        registerHandler.handle(mapper.toRegisterRequestDto(message));\n    }"
  },
  "appSaveTx": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 269,
    "code": "    @Transactional\n    @Override\n    public Application saveApplication(Long applicationId, BaseApplicationRequestDto requestDto) throws BaseException {\n        String serviceCode = requestDto.getServiceCode();\n        Application application = null;\n        if (applicationId != null) {\n            application = getApplicationById(applicationId);\n            serviceCode = application.getServiceCode();\n        } else {\n            // A switched-off service can't be started. An existing draft may still be edited; submit checks again.\n            serviceAvailabilityGate.assertOpen(serviceCode);\n        }\n        ApplicationStrategy<? super BaseApplicationRequestDto> strategy = applicationStrategyFactory.getStrategy(serviceCode);\n        Application saved = strategy.saveApplication(applicationId, requestDto, application);"
  },
  "draftTx": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 102,
    "code": "    @Override\n    @Transactional\n    public Application saveApplication(Long applicationId, ReagentRegistrationRequestDto requestDto,\n                                       @Nullable Application existingApplication) throws BaseException {"
  },
  "approvalTx": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 797,
    "code": "    @Transactional\n    @Override\n    public void handleApplicationReviewCreated(ReviewRequestCreatedMessage payload) {\n        Application application = applicationRepository.findById((long) payload.getApplicationId()).orElse(null);"
  },
  "approvalListener": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/event/listener/ApplicationEventListener.java",
    "line": 66,
    "code": "    @TransactionalEventListener\n    public void handleApplicationApprovedEvent(ApplicationApprovedDomainEvent domainEvent) {\n        try {\n            producer.produceApplicationApprovedEvent(domainEvent);\n        } catch (Exception e) {\n            log.error(\"Failed to produce ApplicationApprovedMessage for application: {}\",\n                    domainEvent.getApplication().getApplicationNo(), e);\n        }"
  },
  "operationListener": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/kafka/producer/ProfileKafkaProducer.java",
    "line": 117,
    "code": "    @TransactionalEventListener\n    public void produceProfileLicenseOperationEvent(ProfileLicenseOperationEvent domainEvent) {\n        log.info(\"ProfileLicenseOperationEvent: {}\", domainEvent);\n        ProfileLicenseOperationMessage message = profileMapper.toProfileLicenseOperationMessage(domainEvent, serviceName);\n        publishWithOutbox(String.valueOf(domainEvent.profileId()), \"PROFILE_LICENSE_OPERATION\",\n                kafkaConfiguration.getProfileLicenseOperationTopic(), message);\n    }\n\n    private void publishWithOutbox(String messageId, String eventType, String topic, Object message) {\n        String payload = writeJson(message);\n        try {\n            kafkaTemplate.send(topic, message);\n            outboxService.record(messageId, eventType, topic, payload, \"PUBLISHED\", null);"
  },
  "syncEntry": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 156,
    "code": "    void syncProducts(Application application, @Nullable List<ReagentProductRequestDto> products)\n            throws BaseException {\n        if (products == null) {\n            return;\n        }\n        Map<Long, ApplicationReagentProduct> saved = productRepository\n                .findByApplication_IdOrderByPositionAscIdAsc(application.getId()).stream()"
  },
  "reviewPaymentBefore": {
    "repo": "MOH-Review",
    "rev": "5effb54",
    "path": "src/main/java/kh/gov/esb/review/kafka/ReviewKafkaConsumer.java",
    "line": 125,
    "code": "        ReviewApprovalRequest request = reviewApprovalRequestRepository.findByAppId(payload.getAppId()).orElse(null);\n        if (request == null) {\n            // Same race as application_submitted_message: retry rather than lose the PAID status.\n            throw new ReviewRequestNotYetCreatedException(payload.getAppId());\n        }\n\n        if (request.getStatus() == ApprovalStatus.APPROVED || request.getStatus() == ApprovalStatus.REJECTED) {\n            log.info(\"Skipping payment handling for appId={}, already in terminal status={}\", payload.getAppId(), request.getStatus());\n            return;\n        }\n\n        // Payment completed before submission (PAY_FIRST). Just record PAID — the submission\n        // handler will auto-skip the PAYMENT step when the application is submitted.\n        if (request.getStatus() == ApprovalStatus.DRAFT) {\n            reviewApprovalRequestRepository.updatePaymentStatusAndLockedById(request.getId(), PaymentStatus.PAID, request.getLockedBy());\n            log.info(\"Marked payment PAID for draft appId={}, step transition deferred to submission\", payload.getAppId());\n            return;\n        }"
  },
  "reviewPaymentAfter": {
    "repo": "MOH-Review",
    "rev": "5effb54",
    "path": "src/main/java/kh/gov/esb/review/kafka/ReviewKafkaConsumer.java",
    "line": 144,
    "code": "        boolean autoTransferred = false;\n        try {\n            ReviewWorkflowStep currentStep = approvalHelper.getCurrentStep(request);\n            if (ReviewWorkflowStepType.PAYMENT.name().equals(currentStep.getStepType())) {\n                ReviewWorkflowStep nextStep = approvalHelper.getNextStep(request, currentStep);\n\n                if (ReviewWorkflowStepType.PAYMENT.name().equals(nextStep.getStepType())) {\n                    nextStep = approvalHelper.getNextStep(request, nextStep);\n                }\n\n                ReviewWorkflowStepRequirement nextReviewWorkflowStepRequirement = stepRequirementService.getByStepId(nextStep.getId());\n                if (nextReviewWorkflowStepRequirement != null) {\n                    log.info(\"next review workflow step requirement: {}\", nextReviewWorkflowStepRequirement);\n                    reviewKafkaProducer.sendReviewActionRequiredMessage(ReviewActionRequiredMessage.newBuilder()\n                            .setApplicationId(payload.getAppId())\n                            .setRequirements(nextReviewWorkflowStepRequirement.getRequirementType())\n                            .build());\n                }\n\n                String nextStepTargetUserId = approvalHelper.resolveAutoAssignUserId(nextStep);\n                User applicant = approvalHelper.getApplicant(request);\n                String actorId = applicant != null ? applicant.getUserId() : \"SYSTEM\";\n\n                boolean isPaymentWaived = Objects.equals(payload.getInvoiceStatus(), \"WAIVED\");\n                approvalHelper.saveAction(request, currentStep, nextStep, ApprovalStatus.IN_REVIEW, actorId, null, isPaymentWaived ? ReviewActionType.PAYMENT_WAIVED : ReviewActionType.PAYMENT_PAID, nextStepTargetUserId);\n\n                reviewApprovalRequestRepository.updatePaymentStatusAndLockedById(request.getId(), PaymentStatus.PAID, nextStepTargetUserId);\n                request.setLockedBy(nextStepTargetUserId);\n                approvalHelper.updateRequestStatus(request, ApprovalStatus.IN_REVIEW);\n\n                autoTransferred = true;\n                log.info(\"Auto-transferred appId={} to next step order={} after payment\", payload.getAppId(), nextStep.getStepOrder());"
  },
  "certificateUnique": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/model/Certificate.java",
    "line": 41,
    "code": "@Table(name = \"certificates\",\n        indexes = {\n                @Index(name = \"idx_certificate_template_type\", columnList = \"template_type\"),\n                @Index(name = \"idx_certificate_license_id\", columnList = \"license_id\"),\n                @Index(name = \"idx_certificate_license_id_created_at\", columnList = \"license_id, created_at\"),\n        },\n        uniqueConstraints = {\n                @UniqueConstraint(\n                        name = \"uq_certificate_license_template\",\n                        columnNames = {\"license_id\", \"template_type\"}\n                )}\n)"
  },
  "jsonSelector": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/dto/request/base/BaseApplicationRequestDto.java",
    "line": 98,
    "code": "@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = \"service_code\", include = JsonTypeInfo.As.EXISTING_PROPERTY)\n@JsonSubTypes({\n        @JsonSubTypes.Type(value = PharmaLicenseRegistrationRequestDto.class, name = ServiceCode.PHARMA_LICENSE_REGISTRATION),"
  },
  "strategyFactory": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/application/ApplicationStrategyFactory.java",
    "line": 22,
    "code": "    private final Map<String, ApplicationStrategy<?>> strategies;\n    private final ApplicationMapper applicationMapper;\n\n    @Autowired\n    public ApplicationStrategyFactory(Map<String, ApplicationStrategy<?>> strategies, ApplicationMapper applicationMapper) {\n        this.strategies = strategies;\n        this.applicationMapper = applicationMapper;\n    }\n\n    @SuppressWarnings(\"unchecked\")\n    public <T extends BaseApplicationRequestDto> ApplicationStrategy<T> getStrategy(String serviceCode) throws BaseException {\n        ApplicationStrategy<?> strategy = this.strategies.get(serviceCode);\n        if (strategy == null) {\n            throw new BaseException(\"Unsupported service type!\", HttpStatus.UNPROCESSABLE_ENTITY.value());\n        }\n        return (ApplicationStrategy<T>) strategy;\n    }"
  },
  "strategyBean": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 73,
    "code": "@Service(ServiceCode.REAGENT_LICENSE_REGISTRATION)\n@RequiredArgsConstructor\npublic class ReagentRegistrationApplicationStrategy implements ApplicationStrategy<ReagentRegistrationRequestDto> {"
  },
  "strategySave": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 126,
    "code": "        Application saved = registerHandler.saveApplication(applicationId, requestDto, existingApplication,\n                (req, app) -> {\n                    ReagentRequestDto reagent = req.getReagent();\n                    if (reagent != null && reagent.getProducts() != null && !reagent.getProducts().isEmpty()) {\n                        String name = reagent.getProducts().get(0).getProductName();\n                        app.setApplicationNameEn(name);\n                        // Invoice issuance uses the Khmer application name when there is no company.\n                        app.setApplicationNameKh(name);\n                    }\n                });\n        ReagentRequestDto reagent = requestDto.getReagent();\n        if (reagent != null) {\n            saveDetail(saved, reagent);\n            syncProducts(saved, reagent.getProducts());\n        }"
  },
  "productRepository": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/repository/ApplicationReagentProductRepository.java",
    "line": 8,
    "code": "public interface ApplicationReagentProductRepository extends JpaRepository<ApplicationReagentProduct, Long> {\n\n    /** Saved list in the applicant's order; the id breaks ties so the order is always deterministic. */\n    List<ApplicationReagentProduct> findByApplication_IdOrderByPositionAscIdAsc(Long applicationId);\n\n    long countByApplication_Id(Long applicationId);\n}"
  },
  "issuedFields": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/kafka/producer/CertificateEventProducer.java",
    "line": 56,
    "code": "            case \"ISSUE\", \"CREATE\" -> CertificateIssuedMessage.newBuilder()\n                    .setOperationId(operationId)\n                    .setOperationType(operationType)\n                    .setLicenseId(licenseId)\n                    .setLicenseNo(licenseNo)\n                    .setServiceCode(serviceCode)\n                    .setProfileId(profileId)\n                    .setProfileNo(profileNo)\n                    .setUserId(userId)\n                    .setError(errorCode)\n                    .setErrorMessage(errorMessage)\n                    .setTimestamp(timestamp)\n                    .build();\n\n            case \"RENEW\" -> CertificateRenewedMessage.newBuilder()"
  },
  "issuedConsumer": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/kafka/consumer/CertificateEventConsumer.java",
    "line": 23,
    "code": "    @KafkaListener(topics = \"#{@kafkaConfiguration.certificateIssuedTopic}\", groupId = \"#{@kafkaConfiguration.profileGroup}\")\n    public void handleCertificateIssued(@Payload CertificateIssuedMessage payload) {\n        certificateService.processCertificateEvent(payload.getLicenseId(), CertificateOperationType.ISSUE,\n                payload.getError(), payload.getOperationId().toString());\n    }"
  },
  "resultStatus": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/CertificateServiceImpl.java",
    "line": 51,
    "code": "    @Override\n    public void processCertificateEvent(long licenseId, CertificateOperationType operationType, int error, String operationId) {\n        log.info(\"Processing certificate event: operation_type={}, license_id={}, operation_id={}, error={}\",\n                operationType, licenseId, operationId, error);\n\n        Optional<License> optionalLicense = licenseRepository.findById(licenseId);\n        if (optionalLicense.isEmpty()) {\n            log.error(\"License not found for id={}, operation_id={}\", licenseId, operationId);\n            return;\n        }\n\n        License license = optionalLicense.get();\n        CertificateStatus newStatus;\n\n        if (error == 0) {\n            newStatus = operationType == CertificateOperationType.REVOKE\n                    ? CertificateStatus.REVOKED\n                    : CertificateStatus.READY;\n        } else {\n            newStatus = CertificateStatus.FAILED;\n        }\n\n        license.setCertificateStatus(newStatus);\n        licenseRepository.save(license);\n\n        log.info(\"Updated license id={} certificateStatus to {} (operation_id={})\", licenseId, newStatus, operationId);"
  },
  "downloadClient": {
    "repo": "MOH-Registry-Public-Portal",
    "rev": "71509533",
    "path": "app/repositories/certificate.ts",
    "line": 1,
    "code": "export function certificateRepository(fetcher: typeof $fetch) {\n  return {\n    download: (licenseId: number, certificateType?: string) => {\n      return certificateType\n        ? fetcher(`/certificates/${licenseId}/${certificateType}/preview?download=true`)\n        : fetcher(`/certificates/by-license/${licenseId}/preview?download=true`);\n    },\n  };\n}"
  },
  "certificateGateway": {
    "repo": "MOH-Public-Gateway",
    "rev": "32a85fb",
    "path": "src/main/java/kh/gov/esb/public_gateway/configuration/route/CertificateRouteConfiguration.java",
    "line": 24,
    "code": "                        fn -> fn.method(HttpMethod.GET)\n                                .and()\n                                .path(\"/api/v1/certificates/**\")\n                                .filters(filterSpec -> filterSpec\n                                        .filter(tokenRequirementFilterFactory.apply(new TokenRequirementFilterFactory.Config(List.of(HeaderToken.AUTHORIZATION))))\n                                        .filter(authorizationFilter)\n                                )\n                                .uri(certificateServiceUrl))\n                .build();"
  },
  "downloadController": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/controller/CertificateController.java",
    "line": 91,
    "code": "    @GetMapping(\"/by-license/{licenseId}/preview\")\n    @Operation(summary = \"Preview or download the latest active certificate PDF by license ID\")\n    public Mono<ResponseEntity<InputStreamResource>> previewByLicenseId(\n            @PathVariable(\"licenseId\") Long licenseId,\n            @RequestParam(value = \"download\", defaultValue = \"false\") boolean download) {\n\n        log.info(\"Certificate request by licenseId: {}, download: {}\", licenseId, download);\n\n        return Mono.fromCallable(new DelegatingSecurityContextCallable<>(\n                        () -> certificateService.getCertificateByLicenseId(licenseId)\n                )).subscribeOn(Schedulers.boundedElastic())\n                .flatMap(certificate -> streamPdf(certificate, download))\n                .onErrorMap(e -> !(e instanceof BaseException), e -> {"
  },
  "downloadLookup": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/service/CertificateServiceImpl.java",
    "line": 306,
    "code": "    public Certificate getCertificateByLicenseId(Long licenseId) throws BaseException {\n        // Renew and transfer leave the licence's current certificate as RENEWED / TRANSFERRED, not ENABLE.\n        // Officers also get a revoked or disabled certificate when the licence has nothing in use.\n        Optional<Certificate> inUse = certificateRepository\n                .findFirstByLicenseIdAndStatusInOrderByUpdatedAtDesc(licenseId, IN_USE_STATUSES);\n        Optional<Certificate> found = inUse.isPresent() || !authenticationFacade.isBackoffice()\n                ? inUse\n                : certificateRepository.findFirstByLicenseIdAndObjectNameIsNotNullOrderByUpdatedAtDesc(licenseId);\n        Certificate certificate = found\n                .orElseThrow(() -> new BaseException(\"certificate.not.found\", HttpStatus.NOT_FOUND.value()));\n        if (!authenticationFacade.isBackoffice()\n                && !isTrustedServiceCaller()\n                && !Objects.equals(certificate.getUserId(), authenticationFacade.getPublicUserId())) {\n            throw new BaseException(\"certificate.not.found\", HttpStatus.NOT_FOUND.value());\n        }\n        return certificate;\n    }"
  },
  "streamPdf": {
    "repo": "MOH-Certificate",
    "rev": "f84605e",
    "path": "src/main/java/kh/gov/esb/certificate/controller/CertificateController.java",
    "line": 164,
    "code": "    private Mono<ResponseEntity<InputStreamResource>> streamPdf(String objectName, String fileETag, String fileName,\n                                                                String contentType, boolean download) {\n        log.info(\"Certificate found - objectName: {}, fileName: {}, etag: {}\", objectName, fileName, fileETag);\n\n        if (objectName == null || objectName.isBlank()) {\n            return Mono.error(new BaseException(\"certificate.pdf.not.ready\", HttpStatus.NOT_FOUND.value()));\n        }\n\n        return Mono.fromCallable(() ->\n                minioObjectUtility.getObject(objectName, fileETag).toByteArray()\n        ).subscribeOn(Schedulers.boundedElastic()).map(pdfBytes -> {\n            if (pdfBytes.length == 0) {\n                log.error(\"Certificate file is empty or not found in storage\");\n            }\n\n            String contentDisposition = download\n                    ? \"attachment; filename=\\\"\" + fileName + \"\\\"\"\n                    : \"inline\";\n\n            HttpHeaders headers = new HttpHeaders();\n            headers.set(HttpHeaders.CONTENT_DISPOSITION, contentDisposition);\n            headers.setContentLength(pdfBytes.length);"
  },
  "regenerateEligibility": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/CertificateServiceImpl.java",
    "line": 79,
    "code": "    @Transactional\n    @Override\n    public void invokeRegenerateCertificate(List<Long> licenseIds) {\n        log.info(\"Invoking regenerate certificate for license ids: {}\", licenseIds);\n\n        List<RegulatoryRegistration> registrations = regulatoryRegistrationRepository.findAllWithLicenseByLicenseIdIn(licenseIds);\n        if (registrations.isEmpty()) {\n            log.warn(\"No licenses found for ids: {}\", licenseIds);\n            return;\n        }\n\n        List<RegulatoryRegistration> eligible = registrations.stream()\n                .filter(r -> r.getLicense().getStatus() == LicenseStatus.ACTIVE)\n                .filter(r -> r.getLicense().getCertificateStatus() != CertificateStatus.PENDING)\n                .toList();\n\n        if (eligible.isEmpty()) {\n            log.warn(\"No eligible licenses found for regeneration from ids: {}\", licenseIds);\n            return;\n        }"
  },
  "regeneratePublish": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/CertificateServiceImpl.java",
    "line": 115,
    "code": "                    List<License> groupedLicenses = grouped.stream()\n                            .map(RegulatoryRegistration::getLicense)\n                            .toList();\n                    strategy.publishCertificateOperationEvent(\n                            LicenseOperationType.REGENERATE, profile, serviceCode, groupedLicenses);\n                });"
  },
  "newOperationId": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/kafka/event/ProfileLicenseOperationEvent.java",
    "line": 27,
    "code": "    public static ProfileLicenseOperationEvent from(LicenseOperationType operationType, Profile profile, String serviceCode, Map<String, Object> payload) {\n        return ProfileLicenseOperationEvent.builder()\n                .operationId(UUID.randomUUID().toString())\n                .operationType(operationType.name())\n                .departmentId(profile.getDepartmentId())\n                .serviceCode(serviceCode)\n                .profileId(profile.getId())\n                .profileNo(profile.getNo())\n                .payload(payload)\n                .build();\n    }\n}"
  },
  "syncRules": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 150,
    "code": "\n    /**\n     * Applies the full product list sent by the client without losing identities: a product with an\n     * {@code id} updates that saved product, one without gets a new id, saved products left out are removed.\n     * A null list keeps the saved products; an empty list removes them all.\n     */\n    void syncProducts(Application application, @Nullable List<ReagentProductRequestDto> products)\n            throws BaseException {\n        if (products == null) {\n            return;\n        }\n        Map<Long, ApplicationReagentProduct> saved = productRepository\n                .findByApplication_IdOrderByPositionAscIdAsc(application.getId()).stream()\n                .collect(Collectors.toMap(ApplicationReagentProduct::getId, Function.identity()));\n\n        Map<String, Object> fieldErrors = new LinkedHashMap<>();\n        Set<Long> seen = new HashSet<>();\n        for (int i = 0; i < products.size(); i++) {\n            ReagentProductRequestDto dto = products.get(i);\n            if (dto == null) {\n                fieldErrors.put(item(i), \"not.null\");\n                continue;\n            }\n            Long productId = dto.getId();\n            if (productId != null && !saved.containsKey(productId)) {\n                fieldErrors.put(item(i) + \".id\", \"reagent.product.item.not.found\");\n            } else if (productId != null && !seen.add(productId)) {\n                fieldErrors.put(item(i) + \".id\", \"reagent.product.item.duplicate\");\n            }\n            checkAttachmentOwnership(dto.getAttachments(), item(i) + \".attachments\", fieldErrors);\n        }\n        if (!fieldErrors.isEmpty()) {\n            throw new CustomValidationException(\"application.validation.failed\", fieldErrors);\n        }\n"
  },
  "syncRemove": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 185,
    "code": "        List<ApplicationReagentProduct> removed = saved.values().stream()\n                .filter(p -> !seen.contains(p.getId()))\n                .toList();\n        productRepository.deleteAll(removed);\n\n        for (int i = 0; i < products.size(); i++) {\n            ReagentProductRequestDto dto = products.get(i);\n            ApplicationReagentProduct product = dto.getId() != null\n                    ? saved.get(dto.getId())\n                    : ApplicationReagentProduct.builder().application(application).build();\n            reagentMapper.updateProduct(dto, product);\n            product.setPosition(i);\n            // Same lookup as the application's own attachments: unknown file ids are rejected and the stored\n            // name, path, size and content type are copied from the uploaded file.\n            List<AttachmentDto> resolved = attachmentResolutionService.resolve(dto.getAttachments());\n            product.setAttachments(resolved != null ? attachmentMapper.toAttachments(resolved) : null);\n            productRepository.save(product);"
  },
  "fileOwnership": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 206,
    "code": "    private void checkAttachmentOwnership(@Nullable List<AttachmentDto> attachments, String errorKey,\n                                          Map<String, Object> fieldErrors) {\n        String publicUserId = authenticationFacade.getPublicUserId();\n        if (attachments == null || publicUserId == null) {\n            return;\n        }\n        for (AttachmentDto attachment : attachments) {\n            if (attachment != null && attachment.getId() != null\n                    && applicationFileRepository.findByIdAndUserId(attachment.getId(), publicUserId).isEmpty()) {\n                fieldErrors.putIfAbsent(errorKey, \"attachment.not.owned\");\n            }\n        }\n    }"
  },
  "dtoList": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/dto/request/ReagentRequestDto.java",
    "line": 13,
    "code": " * product list.\n *\n * <p>List semantics on save: {@code products} omitted (null) keeps the saved list; a list replaces membership\n * (items with {@code id} are updated, items without one are added, saved items left out are removed); an\n * empty list clears the draft. Submission requires at least one product.\n */\n@Data\n@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)\npublic class ReagentRequestDto {\n\n    /** The applicant's TR01 or TR07 establishment profile; checked on submit (same rule as DR03 and DR08). */\n    private Long prerequisiteProfileId;\n\n    @Valid\n    private List<ReagentProductRequestDto> products;\n\n    /** Reject the obsolete shared origin even when the application ObjectMapper ignores unknown fields. */\n    @JsonProperty(\"application_type\")\n    public void rejectApplicationType(Object ignored) {\n        throw new IllegalArgumentException(\"Use reagent.products[].application_type (LOCAL or IMPORT) for each product\");\n    }\n}"
  },
  "profileHook": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/handler/hook/RegisterHandlerHooks.java",
    "line": 9,
    "code": "public interface RegisterHandlerHooks<T extends RegisterRequestDto, D> {\n    D initDetails(T requestDto);\n\n    default Profile resolveProfile(T requestDto, BaseRegisterHandler base) throws NotFoundException {\n        return base.getOrCreateNewProfile(requestDto);\n    }\n\n    void processLicenses(LicenseRegistrationContext<D> ctx, T requestDto) throws NotFoundException;"
  },
  "genericResolver": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/handler/BaseRegisterHandler.java",
    "line": 139,
    "code": "    public Profile getOrCreateNewProfile(RegisterRequestDto requestDto) {\n        return getOrCreateNewProfile(requestDto, requestDto.getServiceCode());\n    }\n\n    public Profile getOrCreateNewProfile(RegisterRequestDto requestDto, String serviceCode) {\n        String singleId = normalizeId(requestDto.getCompany() == null ? null : requestDto.getCompany().getSingleId());\n        String identityNumber = normalizeId(requestDto.getLicensee() == null ? null : requestDto.getLicensee().getIdentityNumber());\n        return getOrCreateNewProfile(requestDto, serviceCode, singleId, identityNumber);\n    }\n\n    public Profile getOrCreateNewProfile(RegisterRequestDto requestDto, String serviceCode, String singleId, String identityNumber) {\n        if (serviceCode == null || (singleId == null && identityNumber == null)) {\n            return createNewProfile(requestDto);\n        }\n\n        Optional<Profile> companyProfile = singleId != null\n                ? profileRepository.findFirstByCompany_SingleIdOrderByIdAsc(singleId)\n                : profileRepository.findFirstByLicensee_IdentityNumberOrderByIdAsc(identityNumber);\n\n        return companyProfile\n                .filter(profile -> !regulatoryRegistrationRepository.existsByProfile_IdAndServiceCode(profile.getId(), serviceCode))\n                .orElseGet(() -> createNewProfile(requestDto));\n    }\n\n    private static String normalizeId(String value) {"
  },
  "reagentHandler": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/strategy/handler/ReagentRegisterHandler.java",
    "line": 42,
    "code": "public class ReagentRegisterHandler implements RegisterHandlerHooks<ReagentRegisterRequestDto, ReagentDetailsContext> {\n\n    private final BaseRegisterHandler registerHandler;\n    private final ApplicationEventPublisher applicationEventPublisher;\n    private final ReagentLicenseBuilder licenseBuilder;\n    private final ReagentProductLicenseDetailRepository detailRepository;\n    private final ReagentMapper mapper;\n    private final RegulatoryRegistrationService regulatoryRegistrationService;\n    private final ReagentCertificatePublishStrategy certificatePublishStrategy;\n\n    /**\n     * Module-level replay guard: if this application already produced DR06 licences, nothing is created and\n     * nothing is published again. The unique (source_application_id, source_product_id) key in this module's own\n     * table backs it up for concurrent deliveries. The core consumer and handler are used unchanged.\n     */\n    public void handle(ReagentRegisterRequestDto requestDto) throws NotFoundException {\n        if (detailRepository.existsBySourceApplicationId(requestDto.getApplicationId())) {\n            log.info(\"[GDHT-RG-L] Approval for application {} ({}) was already processed; replay ignored\",\n                    requestDto.getApplicationId(), requestDto.getApplicationNo());\n            return;\n        }\n        registerHandler.handle(requestDto, this);\n    }\n\n    @Override\n    public ReagentDetailsContext initDetails(ReagentRegisterRequestDto requestDto) {\n        return new ReagentDetailsContext();\n    }\n\n    @Override\n    public void processLicenses(LicenseRegistrationContext<ReagentDetailsContext> ctx,"
  },
  "profileRead": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/ReagentProductServiceImpl.java",
    "line": 54,
    "code": "    @Override\n    public ReagentProductResponseDto getProduct(Long registrationId, String userId) throws NotFoundException {\n        ReagentProductLicenseDetail detail = repository.findWithLicenseById(registrationId)\n                .orElseThrow(() -> new NotFoundException(NOT_FOUND + \": \" + registrationId));\n        assertOwner(detail.getProfile(), userId);\n        return mapper.toProductResponseDto(detail);\n    }\n"
  },
  "profileOwner": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/ReagentProductServiceImpl.java",
    "line": 99,
    "code": "    }\n\n    /** Same answer as \"missing\" so another user's profile ids are not revealed. */\n    static void assertOwner(Profile profile, String userId) throws NotFoundException {\n        if (userId != null && (profile == null || !userId.equals(profile.getUserId()))) {\n            throw new NotFoundException(NOT_FOUND);\n        }\n    }\n}"
  },
  "productEndpoint": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/ReagentProductController.java",
    "line": 63,
    "code": "        return getOkResponse(service.getProduct(registrationId, publicUserId()));\n    }\n\n    /** Profile summary of a profile holding DR06 products. */\n    @GetMapping(\"/{profileId}\")\n    public ResponseEntity<ApiResponse<ReagentProfileResponseDto>> getProfile(@PathVariable Long profileId)\n            throws BaseException {"
  },
  "productJoin": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/ReagentProductLicenseDetailRepository.java",
    "line": 25,
    "code": "    /** One product with its registration and licence loaded (read API needs the licence number and dates). */\n    @Query(\"SELECT d FROM ReagentProductLicenseDetail d \" +\n            \"JOIN FETCH d.registration r LEFT JOIN FETCH r.license LEFT JOIN FETCH d.profile \" +\n            \"WHERE d.id = :registrationId\")\n    Optional<ReagentProductLicenseDetail> findWithLicenseById(@Param(\"registrationId\") Long registrationId);"
  },
  "profileResponse": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/mapper/ReagentMapper.java",
    "line": 163,
    "code": "    public ReagentProductResponseDto toProductResponseDto(ReagentProductLicenseDetail d) {\n        if (d == null) {\n            return null;\n        }\n        ReagentProductResponseDto dto = new ReagentProductResponseDto();\n        dto.setRegistrationId(d.getId());\n        RegulatoryRegistration registration = d.getRegistration();\n        if (registration != null) {\n            dto.setRegistrationUuid(registration.getRegistrationUUID());\n            License license = registration.getLicense();\n            if (license != null) {\n                dto.setLicenseNo(license.getLicenseNo());\n                dto.setProductNo(license.getProductNo());\n                dto.setLicenseStatus(license.getStatus() != null ? license.getStatus().name() : null);\n                dto.setIssueDate(license.getIssueDate());\n                dto.setExpiryDate(license.getExpiryDate());\n            }\n        }\n        dto.setProfileId(d.getProfile() != null ? d.getProfile().getId() : null);\n        dto.setPrerequisiteProfileId(d.getPrerequisiteProfileId());\n        dto.setSourceApplicationNo(d.getSourceApplicationNo());\n        dto.setSourceProductId(d.getSourceProductId());\n        dto.setApplicationType(d.getApplicationType());\n        dto.setProductName(d.getProductName());\n        dto.setReferenceModel(d.getReferenceModel());\n        dto.setPackSize(d.getPackSize());\n        dto.setManufacturerName(d.getManufacturerName());\n        dto.setManufacturerAddress(d.getManufacturerAddress());\n        dto.setManufacturerCountry(d.getManufacturerCountry());\n        dto.setMahName(d.getMahName());\n        dto.setMahAddress(d.getMahAddress());\n        dto.setAttachments(toAttachmentDtos(d.getAttachments()));\n        dto.setSharedAttachments(toAttachmentDtos(d.getSharedAttachments()));\n        return dto;"
  },
  "profileContract": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/mapper/ReagentMapper.java",
    "line": 66,
    "code": "    public ReagentRegisterRequestDto toRegisterRequestDto(ApplicationApprovedMessage message) {\n        ReagentFormData formData = parseFormData(message.getFormData());\n        ReagentFormData.Reagent reagent = formData.getReagent();\n        if (reagent == null) {\n            throw new IllegalArgumentException(\"DR06 approved message \" + message.getId() + \" has no form_data.reagent\");\n        }\n        if (!Integer.valueOf(SUPPORTED_CONTRACT_VERSION).equals(reagent.getContractVersion())) {\n            throw new IllegalArgumentException(\"Unsupported DR06 form_data contract_version \"\n                    + reagent.getContractVersion() + \" for application \" + message.getId()\n                    + \"; numeric product IDs require version 3\");\n        }\n        if (reagent.getApplicationType() != null) {\n            throw new IllegalArgumentException(\"DR06 version 3 uses reagent.products[].application_type, not reagent.application_type\");\n        }\n        if (message.getId() <= 0 || message.getApplicationNo() == null || message.getApplicationNo().isBlank()) {\n            throw new IllegalArgumentException(\"DR06 approval requires application identity\");\n        }\n        List<ReagentProductDto> products = reagent.getProducts();\n        if (products == null || products.isEmpty()) {\n            throw new IllegalArgumentException(\"DR06 approved message \" + message.getId() + \" has no products\");\n        }\n        Set<Long> productIds = new HashSet<>();\n        Set<Integer> positions = new HashSet<>();\n        for (ReagentProductDto product : products) {\n            if (product == null) {\n                throw new IllegalArgumentException(\"DR06 approved message \" + message.getId() + \" has a null product\");\n            }\n            if (product.getApplicationType() == null) {\n                throw new IllegalArgumentException(\"DR06 approved message \" + message.getId()\n                        + \" has no application_type for item \" + product.getId());\n            }\n            if (product.getId() == null || product.getId() <= 0 || !productIds.add(product.getId())) {\n                throw new IllegalArgumentException(\"DR06 approved message \" + message.getId()\n                        + \" has a product with a missing, invalid or repeated numeric id\");\n            }\n            if (product.getPosition() == null || product.getPosition() < 0 || !positions.add(product.getPosition())) {\n                throw new IllegalArgumentException(\"DR06 product has missing, negative or repeated position\");\n            }\n        }\n\n        validateAttachmentScope(formData.getAttachments(), true);"
  },
  "attachmentPlacement": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 310,
    "code": "    private void validateAttachmentPlacement(List<AttachmentDto> attachments, boolean shared,\n                                             String path, Map<String, Object> errors) {\n        if (attachments == null) return;\n        for (AttachmentDto attachment : attachments) {\n            if (attachment == null || attachment.getKey() == null || attachment.getKey().isBlank()\n                    || shared != SHARED_DOCUMENT_KEY.equals(attachment.getKey())) {\n                errors.putIfAbsent(path, shared\n                        ? \"Only establishment_decision belongs in shared attachments\"\n                        : \"establishment_decision belongs in shared attachments, not on a product\");\n                return;\n            }\n        }\n    }\n"
  },
  "emptySubmit": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 246,
    "code": "            List<ApplicationReagentProduct> products = productRepository.findByApplication_IdOrderByPositionAscIdAsc(applicationId);\n            if (products.isEmpty()) {\n                fieldErrors.put(PRODUCTS, \"not.empty\");\n                return;\n            }\n            for (int i = 0; i < products.size(); i++) {\n                ApplicationReagentProduct product = products.get(i);\n                collectViolations(reagentMapper.toProductRequestDto(product), item(i), fieldErrors);\n                validateProductAttachments(product, item(i) + \".attachments\", fieldErrors);\n            }"
  },
  "entityIdentity": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/model/ReagentProductLicenseDetail.java",
    "line": 46,
    "code": "    @Id\n    @Column(name = \"registration_id\")\n    private Long id;\n\n    @JsonIgnore\n    @MapsId\n    @OneToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = \"registration_id\")\n    private RegulatoryRegistration registration;\n\n    @ManyToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = \"profile_id\", referencedColumnName = \"id\")\n    private Profile profile;\n\n    @Column(name = \"source_application_id\", nullable = false)\n    private Long sourceApplicationId;\n\n    @Column(name = \"source_application_no\")\n    private String sourceApplicationNo;\n\n    @Column(name = \"source_product_id\", nullable = false)\n    private Long sourceProductId;"
  },
  "resolveList": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/attachment/service/AttachmentResolutionServiceImpl.java",
    "line": 25,
    "code": "    public List<AttachmentDto> resolve(List<AttachmentDto> attachments) throws NotFoundException {\n\n        if (attachments == null || attachments.isEmpty()) {\n            return attachments;\n        }\n\n        Set<String> ids = attachments.stream()\n                .map(AttachmentDto::getId)\n                .filter(Objects::nonNull)\n                .collect(Collectors.toSet());\n\n        if (ids.isEmpty()) {\n            return attachments;\n        }"
  },
  "resolveMetadata": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/attachment/service/AttachmentResolutionServiceImpl.java",
    "line": 40,
    "code": "        Map<String, ApplicationFile> map = applicationFileRepository\n                .findAllById(ids)\n                .stream()\n                .collect(Collectors.toMap(ApplicationFile::getId, a -> a));\n\n        for (AttachmentDto dto : attachments) {\n            ApplicationFile entity = map.get(dto.getId());\n            if (entity == null) {\n                throw new NotFoundException(messageUtility.getMessage(\"attachment.not_found.for.id\", new String[]{dto.getId()}), HttpStatus.NOT_FOUND.value());\n            }\n\n            dto.setFileName(entity.getFileName());\n            dto.setPath(entity.getPath());\n            dto.setName(entity.getOriginalFileName());\n            dto.setContentType(entity.getContentType());\n            dto.setSize(entity.getFileSize());\n        }\n\n        return attachments;"
  },
  "approvalFileScope": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/mapper/ReagentMapper.java",
    "line": 294,
    "code": "    /** Approved snapshots carry establishment evidence at root and all other documents per product. */\n    private void validateAttachmentScope(List<AttachmentDto> attachments, boolean shared) {\n        if (attachments == null || attachments.isEmpty()) {\n            throw new IllegalArgumentException(\"Approval requires shared establishment evidence and product attachments\");\n        }\n        for (AttachmentDto attachment : attachments) {\n            if (attachment == null || attachment.getKey() == null || attachment.getKey().isBlank() || attachment.getId() == null\n                    || attachment.getId().isBlank()\n                    || shared != \"establishment_decision\".equals(attachment.getKey())) {\n                throw new IllegalArgumentException(\"Invalid attachment scope\");\n            }\n        }\n    }\n}"
  },
  "rollbackValidation": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/exception/CustomValidationException.java",
    "line": 1,
    "code": "package kh.gov.esb.application.exception;\n\nimport kh.gov.esb.common_library.enumeration.CommonErrorCode;\nimport kh.gov.esb.common_library.exception.BadRequestException;\nimport lombok.Getter;\n\nimport java.util.Map;\n\n@Getter\npublic class CustomValidationException extends BadRequestException {\n    private final Map<String, Object> fieldErrors;\n\n    public CustomValidationException(String message, Map<String, Object> fieldErrors) {\n        super(message, CommonErrorCode.BAD_REQUEST.getValue());\n        this.fieldErrors = fieldErrors;\n    }\n}"
  },
  "runtimeBase": {
    "repo": "MOH-Common-Library",
    "rev": "48d814c",
    "path": "src/main/java/kh/gov/esb/common_library/exception/BaseException.java",
    "line": 8,
    "code": "@Getter\n@ToString\n@EqualsAndHashCode(callSuper = false)\npublic class BaseException extends RuntimeException {\n\n    protected final Integer error;\n    protected final Integer statusCode;\n\n    public BaseException(String message, Integer error) {\n        super(message);\n        this.error = error;"
  },
  "rollbackNotFound": {
    "repo": "MOH-Common-Library",
    "rev": "48d814c",
    "path": "src/main/java/kh/gov/esb/common_library/exception/NotFoundException.java",
    "line": 1,
    "code": "package kh.gov.esb.common_library.exception;\n\nimport org.springframework.http.HttpStatus;\n\npublic class NotFoundException extends BaseException {\n    private static final Integer errorCode = HttpStatus.NOT_FOUND.value();\n\n    public NotFoundException(String message) {\n        super(message, errorCode, errorCode);\n    }\n\n    public NotFoundException(String message, Integer error) {\n        super(message, error, errorCode);\n    }"
  },
  "caughtPayment": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 747,
    "code": "        try {\n            application.setPaymentStatus(paymentStatus);\n            application.setPaidDate(Instant.now());\n            PaymentContext paymentContext = resolvePaymentContext(application);\n            if (paymentContext == null) {\n                // Paid with no known context (e.g. invoice raised while not DRAFT).\n                // If the application is still a draft, advance it to SUBMITTED now that payment is settled,\n                // so PAID never coexists with DRAFT. Otherwise just record the payment.\n                if (application.getStatus() == ApplicationStatus.DRAFT) {\n                    log.info(\"updatePaymentStatus > Missing paymentContext for applicationId={}, status=DRAFT, payment=PAID; auto-submitting application\", application.getId());\n                    ApplicationStrategy strategy = applicationStrategyFactory.getStrategy(application.getServiceCode());\n                    finalizeSubmission(application, strategy);\n                    return;\n                }\n                log.warn(\"updatePaymentStatus > Missing paymentContext for applicationId={}, status={}; payment recorded, workflow not advanced\", application.getId(), application.getStatus());\n                applicationRepository.save(application);\n                return;\n            }\n            switch (paymentContext) {\n                case SUBMISSION -> {\n                    ApplicationStrategy strategy = applicationStrategyFactory.getStrategy(application.getServiceCode());\n                    finalizeSubmission(application, strategy);"
  },
  "paymentCatch": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 777,
    "code": "        } catch (BaseException e) {\n            log.error(\"updatePaymentStatus > Error finalizing submission: {}\", e.getMessage());\n        }\n    }"
  },
  "paymentEntry": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 723,
    "code": "    @Transactional\n    @Override\n    public void handleApplicationPaid(PaymentCompletedMessage payload) {\n        log.info(\"handleApplicationPaid > received message: {}\", payload);\n        updatePaymentStatus(payload.getAppId(), payload.getInvoiceStatus());\n    }\n\n    @Transactional\n    @Override\n    public void updatePaymentStatus(Long applicationId, String invoiceStatus) {"
  },
  "independentOutbox": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/outbox/OutboxServiceImpl.java",
    "line": 17,
    "code": "    @Transactional(propagation = Propagation.REQUIRES_NEW)\n    @Override\n    public void record(String messageId, String eventType, String topic, String payload, String status, String errorMessage) {\n        try {\n            outboxMessageRepository.save(OutboxMessage.builder()\n                    .messageId(messageId)\n                    .eventType(eventType)\n                    .topic(topic)\n                    .payload(payload)\n                    .status(status)\n                    .errorMessage(errorMessage)\n                    .build());\n            if (\"PUBLISHED\".equals(status)) {\n                log.info(\"[OUTBOX] Published message_id={} event_type={} topic={}\", messageId, eventType, topic);\n            } else {\n                log.error(\"[OUTBOX] Failed message_id={} event_type={} topic={} error={}\", messageId, eventType, topic, errorMessage);\n            }\n        } catch (Exception e) {\n            log.error(\"[OUTBOX] Could not record outbox entry message_id={} event_type={} topic={}\", messageId, eventType, topic, e);\n        }\n    }\n}"
  },
  "profilePublishOutbox": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/kafka/producer/ProfileKafkaProducer.java",
    "line": 125,
    "code": "    private void publishWithOutbox(String messageId, String eventType, String topic, Object message) {\n        String payload = writeJson(message);\n        try {\n            kafkaTemplate.send(topic, message);\n            outboxService.record(messageId, eventType, topic, payload, \"PUBLISHED\", null);\n        } catch (Exception e) {\n            try {\n                outboxService.record(messageId, eventType, topic, payload, \"FAILED\", e.getMessage());\n            } catch (Exception outboxEx) {\n                log.warn(\"[OUTBOX] Failed to record FAILED status for message_id={} event_type={}\", messageId, eventType, outboxEx);\n            }\n            throw e;\n        }\n    }\n"
  },
  "controllerUpdate": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/controller/ApplicationController.java",
    "line": 164,
    "code": "    @PutMapping(\"/{id}\")\n    @Operation(\n            summary = \"Update or save existing application draft.\",\n            tags = {TAG_PUBLIC}\n    )\n    public ResponseEntity<ApiResponse<BaseApplicationResponseDto>> updateApplication(@PathVariable(\"id\") Long applicationId, @Valid @RequestBody BaseApplicationRequestDto requestDto) throws BaseException {\n        Application application = applicationService.saveApplication(applicationId, requestDto);\n        BaseApplicationResponseDto response = applicationStrategyFactory.mapToResponseDto(application);\n        applicationAudienceDecorator.decorate(response, application, authenticationFacade.getAuth().getContext());\n        return getOkResponse(response);\n    }"
  },
  "initializeDraft": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/handler/ApplicationCoreHandler.java",
    "line": 113,
    "code": "    protected <TRequestDto extends BaseApplicationRequestDto> Application initializeApplication(Long applicationId, TRequestDto requestDto, Application existingApplication) throws BaseException {\n        Application application;\n\n        if (applicationId == null) {\n            Service service = serviceRepository.findByCode(requestDto.getServiceCode())\n                    .orElseThrow(() -> new BaseException(\"service.not.found\", HttpStatus.NOT_FOUND.value()));\n\n            if (Objects.isNull(service.getType())) {\n                throw new InternalServerErrorException(\"service.invalid\", HttpStatus.INTERNAL_SERVER_ERROR.value());\n            }\n\n            application = new Application();\n            application.setApplicationType(service.getType());\n            application.setServiceCode(requestDto.getServiceCode());\n            application.setService(service);\n            application.setStatus(ApplicationStatus.DRAFT);\n            application.setPaymentStatus(ApplicationType.RE_REGISTER.getCode().equals(service.getType())\n                    ? ApplicationPaymentStatus.NO_PAYMENT\n                    : ApplicationPaymentStatus.PENDING);\n            application.setUserId(authenticationFacade.getAuth().getUserId());\n            // the Open API client the request came through, if any; user_id above is the acting user\n            String requestClientId = authenticationFacade.getProviderClientId();\n            application.setCreatedByProviderClient(requestClientId != null);\n            // resolve external or internal provider client id\n            application.setProviderClientId(providerClientResolver.resolve(requestClientId));\n            application.setDepartmentId(service.getServiceDomain().getDepartmentId());\n        } else {\n            application = existingApplication != null ? existingApplication : getApplicationById(applicationId);\n            if (application.getStatus() == ApplicationStatus.APPROVED) {\n                throw new BaseException(\"application.has.already.approved\", HttpStatus.BAD_REQUEST.value());\n            }\n            if (application.getStatus() == ApplicationStatus.REJECTED) {\n                throw new BaseException(\"application.has.already.rejected\", HttpStatus.BAD_REQUEST.value());\n            }\n            if (application.isNonEditableStatus()) {\n                throw new BaseException(\"application.cannot.be.updated.as.being.processed\", HttpStatus.BAD_REQUEST.value());\n            }\n        }\n\n        if (requestDto.getFacilityApplicationId() != null) {\n            application.setFacilityApplicationId(requestDto.getFacilityApplicationId());\n        }\n\n        ValidateServiceDocumentResult validateServiceDocumentResult =\n                serviceDocumentGroupService.validateAttachmentsByServiceCode(application.getServiceCode(), requestDto.getAttachments());\n        application.setAttachments(attachmentMapper.toAttachments(validateServiceDocumentResult.getValidAttachments()));\n        return application;\n    }"
  },
  "sharedRegistration": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/handler/ApplicationRegisterHandler.java",
    "line": 33,
    "code": "    public <TRequestDto extends BaseRegistrationApplicationRequestDto> Application saveApplication(\n            Long applicationId,\n            TRequestDto requestDto,\n            Application existingApplication,\n            SpecificFieldProcessor<TRequestDto, Application> specificFieldProcessor\n    ) throws BaseException {\n\n        return coreHandler.saveApplication(applicationId, requestDto, existingApplication, (req, app) -> {\n\n            // Map generic registration fields\n            app.setAcceptInfo(req.isAcceptInfo());\n            app.setLicenseeType(req.getLicenseeType());\n            app.setCompany(companyMapper.fromCompanyRequestDto(req.getCompany()));\n\n            if (req.getLicensee() != null) {\n                resolveLicenseeAttachments(req.getLicensee());\n                if (app.getLicensee() != null) {\n                    personMapper.updatePersonFromDto(req.getLicensee(), app.getLicensee());\n                } else {\n                    app.setLicensee(personMapper.toPerson(req.getLicensee()));\n                }\n            } else {\n                app.setLicensee(null);\n            }\n\n            resolveApplicantAttachments(req);\n            if (app.getApplicant() != null) {\n                applicantMapper.updateApplicantFromDto(req.getApplicant(), app.getApplicant());\n            } else {\n                app.setApplicant(applicantMapper.fromApplicantDto(req.getApplicant()));\n            }\n\n            // Execute the specific logic from strategy\n            if (specificFieldProcessor != null) {\n                specificFieldProcessor.process(req, app);\n            }\n        });\n    }\n\n    public Application submitApplication(Long applicationId, BiConsumer<BaseApplicationRequestDto, Map<String, Object>> specificValidationProcessor) throws BaseException {"
  },
  "coreSave": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/handler/ApplicationCoreHandler.java",
    "line": 94,
    "code": "    public <TRequestDto extends BaseApplicationRequestDto> Application saveApplication(\n            Long applicationId,\n            TRequestDto requestDto,\n            Application existingApplication,\n            SpecificFieldProcessor<TRequestDto, Application> specificFieldProcessor) throws BaseException {\n        Application application = initializeApplication(applicationId, requestDto, existingApplication);\n\n        if (specificFieldProcessor != null) {\n            specificFieldProcessor.process(requestDto, application);\n        }\n\n        if (application.getApplicationNo() == null) {\n            application.setApplicationNo(generateApplicationNo());\n        }\n        application = saveApplicationEntity(application);\n        sendNotifications(application, existingApplication == null ? ApplicationStrategyAction.CREATE : ApplicationStrategyAction.UPDATE);\n        return application;\n    }\n"
  },
  "draftChecks": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 103,
    "code": "    @Transactional\n    public Application saveApplication(Long applicationId, ReagentRegistrationRequestDto requestDto,\n                                       @Nullable Application existingApplication) throws BaseException {\n        Map<String, Object> attachmentErrors = new LinkedHashMap<>();\n        validateAttachmentPlacement(requestDto.getAttachments(), true, \"attachments\", attachmentErrors);\n        var attachmentBody = requestDto.getReagent();\n        if (attachmentBody != null && attachmentBody.getProducts() != null) {\n            for (int i = 0; i < attachmentBody.getProducts().size(); i++) {\n                var product = attachmentBody.getProducts().get(i);\n                if (product != null) validateAttachmentPlacement(product.getAttachments(), false,\n                        PRODUCTS + \"[\" + i + \"].attachments\", attachmentErrors);\n            }\n        }\n        if (!attachmentErrors.isEmpty()) throw new CustomValidationException(\"application.validation.failed\", attachmentErrors);\n\n        ReagentRequestDto body = requestDto.getReagent();\n        if (body != null && body.getProducts() != null) {\n            for (int i = 0; i < body.getProducts().size(); i++) {\n                if (body.getProducts().get(i) == null) {\n                    throw new CustomValidationException(\"application.validation.failed\", Map.of(item(i), \"not.null\"));\n                }\n            }\n        }"
  },
  "applicationOwnerLookup": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 257,
    "code": "    private Optional<Application> getApplication(Long applicationId, String userId) {\n        // An Open API client owns what it created, whichever officer's CamDigiKey token a later call carries.\n        String clientId = authenticationFacade.getProviderClientId();\n        if (clientId != null) {\n            return applicationRepository.findByIdAndProviderClientId(applicationId, clientId);\n        }\n        if (userId != null) {\n            return applicationRepository.findByIdAndUserId(applicationId, userId);\n        }\n        return applicationRepository.findById(applicationId);\n    }"
  },
  "draftNotifications": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/handler/ApplicationCoreHandler.java",
    "line": 320,
    "code": "    public void sendNotifications(Application application, ApplicationStrategyAction action) {\n        switch (action) {\n            case CREATE -> applicationEventPublisher.publishEvent(new ApplicationCreatedDomainEvent(application));\n            case SUBMIT -> {\n                applicationEventPublisher.publishEvent(new ApplicationStatusUpdatedDomainEvent(application));\n                applicationEventPublisher.publishEvent(new ApplicationSubmittedDomainEvent(application));\n            }\n            default -> {\n                // UPDATE emits no event today\n            }\n        }"
  },
  "saveEventTail": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 281,
    "code": "        ApplicationStrategy<? super BaseApplicationRequestDto> strategy = applicationStrategyFactory.getStrategy(serviceCode);\n        Application saved = strategy.saveApplication(applicationId, requestDto, application);\n        if (requestDto.getRelationApplicationId() != null) {\n            applicationRelationService.linkForDraft(saved, List.of(requestDto.getRelationApplicationId()));\n        }\n        if (applicationId == null) {\n            applicationEventPublisher.publishEvent(new ApplicationCreatedDomainEvent(saved));\n        }\n        return saved;\n    }"
  },
  "createdListener": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/event/listener/ApplicationEventListener.java",
    "line": 26,
    "code": "    @TransactionalEventListener\n    public void handleApplicationCreatedEvent(ApplicationCreatedDomainEvent domainEvent) {\n        try {\n            producer.produceApplicationCreatedEvent(domainEvent);\n        } catch (Exception e) {\n            log.error(\"Failed to produce ApplicationCreatedMessage for application: {}\",\n                    domainEvent.getApplication().getApplicationNo(), e);\n        }\n    }"
  },
  "submitEntry": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 341,
    "code": "    public SubmitApplicationResult submitApplication(Long applicationId, boolean forcePaymentFirst, Long facilityApplicationId, Long relationApplicationId, String trackingNo) throws BaseException {\n        Application application = getApplication(applicationId, authenticationFacade.getPublicUserId())\n                .orElseThrow(() -> new NotFoundException(\"application.not.found\"));\n\n        // Only a first submit is gated: returned or awaiting-payment applications are already in progress.\n        if (application.getStatus() == ApplicationStatus.DRAFT) {\n            serviceAvailabilityGate.assertOpen(application);\n        }\n\n        application.assignTrackingNo(resolveTrackingNo(application, trackingNo));\n\n        if (facilityApplicationId != null) {\n            application.setFacilityApplicationId(facilityApplicationId);\n        }\n\n        ApplicationStrategy strategy = applicationStrategyFactory.getStrategy(application.getServiceCode());\n\n        strategy.validateSubmitApplication(application);"
  },
  "coreSubmitValidation": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/handler/ApplicationCoreHandler.java",
    "line": 228,
    "code": "    public void validateSubmitApplication(Application application, BiConsumer<BaseApplicationRequestDto, Map<String, Object>> specificValidationProcessor) throws BaseException {\n        if (application.getStatus() == ApplicationStatus.APPROVED) {\n            throw new BaseException(\"application.has.already.approved\", HttpStatus.BAD_REQUEST.value());\n        }\n        if (application.getStatus() == ApplicationStatus.REJECTED) {\n            throw new BaseException(\"application.has.already.rejected\", HttpStatus.BAD_REQUEST.value());\n        }\n        if (application.isNonEditableStatus()) {\n            throw new BaseException(\"application.cannot.be.submitted.as.being.processed\", HttpStatus.BAD_REQUEST.value());\n        }\n\n        BaseApplicationRequestDto requestDto = objectMapper.convertValue(application, BaseApplicationRequestDto.class);\n        Set<ConstraintViolation<Object>> violations = validator.validate(requestDto, SubmitValidation.class);\n\n        Map<String, Object> fieldErrors = new HashMap<>();\n\n        if (!violations.isEmpty()) {\n            fieldErrors = violations.stream()\n                    .collect(Collectors.toMap(\n                            v -> v.getPropertyPath().toString(),\n                            ConstraintViolation::getMessage,\n                            (existing, replacement) -> existing\n                    ));\n        }\n\n        if (specificValidationProcessor != null) {\n            specificValidationProcessor.accept(requestDto, fieldErrors);\n        }\n\n        ValidateServiceDocumentResult validateServiceDocumentResult =\n                serviceDocumentGroupService.validateAttachmentsByServiceCode(application.getServiceCode(), requestDto.getAttachments());\n\n        List<MissingAttachmentItemResponseDto> missingAttachments = new ArrayList<>(validateServiceDocumentResult.getMissingAttachments());\n        missingAttachments.addAll(missingSectionAttachments(application));\n        missingAttachments.removeIf(item -> isMsmeDocumentBypassed(application, item.getKey()));\n\n        if (!missingAttachments.isEmpty()) {\n            MissingAttachmentResponseDto missingAttachmentResponseDto = new MissingAttachmentResponseDto();\n            missingAttachmentResponseDto.setMessage(\"required.attachments.missing\");\n            missingAttachmentResponseDto.setItems(missingAttachments);\n            fieldErrors.put(\"attachments\", missingAttachmentResponseDto);\n        }\n\n        if (!fieldErrors.isEmpty()) {\n            throw new CustomValidationException(\"application.submission.validation.failed\", fieldErrors);\n        }\n    }\n\n    /**\n     * MSME's own submission form doesn't collect these documents for GDHT-CP-L/GDHT-BCP-L (company registration\n     * certificate, and — since the pharmacist section itself is optional for MSME submissions — every pharmacist\n     * document), so applications created through an OpenApi/MSME client are allowed to submit without them."
  },
  "dr06SubmitChecks": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 233,
    "code": "        return (requestDto, fieldErrors) -> {\n            validateAttachmentPlacement(requestDto.getAttachments(), true, \"attachments\", fieldErrors);\n            ApplicationReagentDetail detail = detailRepository.findByApplicationId(applicationId).orElse(null);\n            if (detail == null) {\n                fieldErrors.put(ROOT, \"not.null\");\n                return;\n            }\n            collectViolations(reagentMapper.toRequestDto(detail), ROOT, fieldErrors);\n            // TR01 (GDHT-PH-L / GDHT-PH-RR) or TR07 (GDHT-FP-L) establishment: ACTIVE, owned by the caller,\n            // holding an active licence. Shared helper used unchanged, as DR03 and DR08 do.\n            formDataHelper.validatePharmaceuticalPrerequisiteLicense(\n                    detail.getPrerequisiteProfileId(), fieldErrors, PREREQUISITE_PROFILE_ID);\n\n            List<ApplicationReagentProduct> products = productRepository.findByApplication_IdOrderByPositionAscIdAsc(applicationId);\n            if (products.isEmpty()) {\n                fieldErrors.put(PRODUCTS, \"not.empty\");\n                return;\n            }\n            for (int i = 0; i < products.size(); i++) {\n                ApplicationReagentProduct product = products.get(i);\n                collectViolations(reagentMapper.toProductRequestDto(product), item(i), fieldErrors);\n                validateProductAttachments(product, item(i) + \".attachments\", fieldErrors);\n            }\n            // The core document check reads the application's attachments only. Add every product's files so it\n            // does not report the product documents missing at the root.\n            requestDto.setAttachments(mergeProductAttachments(requestDto.getAttachments(), products));\n        };\n    }"
  },
  "prerequisiteCheck": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/application/ApplicationFormDataHelper.java",
    "line": 523,
    "code": "    public void validatePharmaceuticalPrerequisiteLicense(Long profileId, Map<String, Object> fieldErrors, String errorKey) {\n        if (profileId == null) {\n            fieldErrors.putIfAbsent(errorKey, \"not.null\");\n            return;\n        }\n        ExternalProfileResponseDto profile = retrieveProfileOrNull(profileId);\n        if (profile == null || !\"ACTIVE\".equals(profile.getStatus())\n                || !(profile.hasActiveLicense(ServiceCode.PHARMA_LICENSE_REGISTRATION)\n                        || profile.hasActiveLicense(ServiceCode.PHARMA_LICENSE_RE_REGISTRATION)\n                        || profile.hasActiveLicense(ServiceCode.FOREIGN_PHARMACEUTICAL_OFFICE_LICENSE_REGISTRATION))) {\n            fieldErrors.putIfAbsent(errorKey, \"pharmaceutical.prerequisite.license.not.registered\");\n        } else if (!authenticationFacade.getUserId().equals(profile.getUserId())) {\n            fieldErrors.putIfAbsent(errorKey, \"pharmaceutical.prerequisite.license.not.owned\");\n        }\n    }"
  },
  "submitGates": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 358,
    "code": "        strategy.validateSubmitApplication(application);\n        // Configurable eligibility/window/prerequisite/reconciliation gate for RENEW/TRANSFER/UPDATE\n        // service codes — a no-op (defaults to pass) for services with no operation_rule_configs rows.\n        operationGate.assertSubmittable(application);\n        // service_relation_rules: link and validate the applications this one depends on — a no-op for services without rules.\n        applicationRelationService.linkForSubmission(application, relationApplicationId != null ? List.of(relationApplicationId) : List.of());\n\n        if (application.isPaymentSettled()) {\n            return finalizeSubmission(application, strategy);\n        }\n\n        boolean paymentRequired = application.isAwaitingPayment() || forcePaymentFirst || reviewService.isPaymentStep(applicationId);\n"
  },
  "finalizeAll": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 421,
    "code": "    private SubmitApplicationResult finalizeSubmission(Application application, ApplicationStrategy strategy) {\n        Instant now = Instant.now();\n        ApplicationStatus submittedStatus = application.getStatus() == ApplicationStatus.RETURNED ? ApplicationStatus.RE_SUBMITTED : ApplicationStatus.SUBMITTED;\n        application.setSubmittedDate(now);\n        if (application.getFirstSubmittedDate() == null) {\n            application.setFirstSubmittedDate(now);\n        }\n\n        // Every path into review (direct submit and paid-after-submit) passes here, so this is the one relation gate.\n        switch (applicationRelationService.evaluate(application)) {\n            case WAITING -> {\n                // Held: no ApplicationSubmittedDomainEvent, so the review service never sees it until released.\n                application.setStatus(ApplicationStatus.WAITING_RELATION);\n                application = applicationRepository.save(application);\n                applicationEventPublisher.publishEvent(new ApplicationStatusUpdatedDomainEvent(application));\n                return SubmitApplicationResult.submitted(application);\n            }\n            case RELATED_REJECTED -> {\n                application = applicationRepository.save(application);\n                returnForRejectedRelation(application);\n                return SubmitApplicationResult.submitted(application);\n            }\n            default -> {\n                // OPEN: fall through to review.\n            }\n        }\n\n        application.setStatus(submittedStatus);\n        application = applicationRepository.save(application);\n        strategy.sendNotifications(application, ApplicationStrategyAction.SUBMIT);\n        return SubmitApplicationResult.submitted(application);"
  },
  "submittedListener": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/event/listener/ApplicationEventListener.java",
    "line": 46,
    "code": "    @TransactionalEventListener\n    public void handleApplicationSubmittedEvent(ApplicationSubmittedDomainEvent domainEvent) {\n        try {\n            producer.produceApplicationSubmittedEvent(domainEvent);\n        } catch (Exception e) {\n            log.error(\"Failed to produce ApplicationSubmittedMessage for application: {}\",\n                    domainEvent.getApplication().getApplicationNo(), e);\n        }\n    }"
  },
  "submittedProducer": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/kafka/producer/ApplicationEventProducer.java",
    "line": 107,
    "code": "    public void produceApplicationSubmittedEvent(ApplicationSubmittedDomainEvent domainEvent) {\n        Application application = domainEvent.getApplication();\n        String key = application.getApplicationNo();\n        String[] actorName = resolveActorName();\n        ApplicationSubmittedMessage message = applicationMapper.toApplicationSubmittedMessage(application, actorName[0], actorName[1]);\n        log.info(\"ApplicationEventProducer > produceApplicationSubmittedEvent: {}\", message);\n        kafkaTemplate.send(kafkaConfiguration.getApplicationSubmittedTopic(), key, message);\n    }"
  },
  "approvalEntry": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 797,
    "code": "    @Transactional\n    @Override\n    public void handleApplicationReviewCreated(ReviewRequestCreatedMessage payload) {\n        Application application = applicationRepository.findById((long) payload.getApplicationId()).orElse(null);\n\n        if (application == null || application.isFinalStatus()) return;\n\n        boolean reviewerAlreadyEngaged = application.getReviewerId() != null;\n        application.setReviewingDepartmentId(payload.getDepartmentId());\n        application.setReviewerId(payload.getReviewerId());\n        application.setReviewStatus(payload.getToStep() != null ? payload.getToStep().longValue() : 0L);\n\n        Instant now = Instant.now();\n        ApprovalStatus status = ApprovalStatus.valueOf(payload.getStatus().name());"
  },
  "approvedForm": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 382,
    "code": "    public Map<String, Object> buildApprovedFormData(Application application) {\n        Map<String, Object> data = formDataHelper.buildCommonFormData(application);\n        formDataHelper.enrichWithAttachments(data, application);\n        data.put(\"application_submitted_date\", application.getSubmittedDate());\n        data.put(\"application_first_submitted_date\", application.getFirstSubmittedDate());\n        detailRepository.findByApplicationId(application.getId()).ifPresent(detail ->\n                data.put(ROOT, buildReagentFormData(detail,\n                        productRepository.findByApplication_IdOrderByPositionAscIdAsc(application.getId()))));\n        return data;\n    }"
  },
  "syncMirrors": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/registration/RegulatoryRegistrationServiceImpl.java",
    "line": 358,
    "code": "    @Override\n    @Transactional\n    public void syncAll(List<RegulatoryRegistration> registrations) {\n        if (registrations == null || registrations.isEmpty()) return;\n\n        List<RegulatoryRegistration> pending = registrations.stream()\n                .filter(Objects::nonNull)\n                .filter(r -> r.getLicense() != null)\n                .toList();\n        if (pending.isEmpty()) return;\n\n        registrationCatalogEnricher.enrich(pending);\n        pending.forEach(this::syncMirrorFields);\n        regulatoryRegistrationRepository.saveAll(pending);\n    }\n\n    private void syncMirrorFields(RegulatoryRegistration registration) {\n        License license = registration.getLicense();\n        registration.setLicenseNo(license.getLicenseNo());\n        if (registration.getRegistrationNumber() == null) {\n            registration.setRegistrationNumber(license.getLicenseNo());\n        }\n        registration.setEffectiveFrom(license.getIssueDate());\n        registration.setEffectiveTo(license.getExpiryDate());\n        registration.setStatus(toRegistrationStatus(license.getStatus()));\n        registration.setUserId(license.getUserId());\n    }\n\n    private RegulatoryRegistrationStatus toRegistrationStatus(LicenseStatus status) {"
  },
  "recordApprovedDocs": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/kafka/consumer/ProfileKafkaConsumer.java",
    "line": 65,
    "code": "     * Feeds the license document history once the strategy has committed. Deliberately non-fatal:\n     * the inbox guard is off, so rethrowing would redeliver the message and re-run a non-idempotent\n     * register / renew just because a history row failed to save.\n     */\n    private void recordDocuments(ApplicationApprovedMessage payload) {\n        try {\n            OperationType.fromApplicationType(payload.getApplicationType()).ifPresent(operationType -> {\n                try {\n                    documentRecorder.recordApproved(\n                            new ApprovedOperation(operationType, payload.getId(), payload.getApplicationNo()),\n                            payload.getFormData());\n                } catch (JsonProcessingException e) {\n                    throw new IllegalStateException(e);\n                }\n            });\n        } catch (Exception e) {\n            log.error(\"License document history not recorded for application_no={}: {}\",\n                    payload.getApplicationNo(), e.toString(), e);\n        }\n    }"
  },
  "submitResultType": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/dto/response/SubmitApplicationResult.java",
    "line": 20,
    "code": "\n    public static SubmitApplicationResult submitted(Application application) {\n        return new SubmitApplicationResult(Status.SUBMITTED, application, null);\n    }\n\n    public static SubmitApplicationResult awaitingPayment(Application application, InvoiceResponseDto invoice) {\n        return new SubmitApplicationResult(Status.AWAITING_PAYMENT, application, invoice);\n    }"
  },
  "relationRejected": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 484,
    "code": "    private void returnForRejectedRelation(Application application) {\n        application.setStatus(ApplicationStatus.RETURNED);\n        application = applicationRepository.save(application);\n        applicationEventPublisher.publishEvent(new ApplicationStatusUpdatedDomainEvent(application));\n        applicationEventPublisher.publishEvent(new ApplicationMsmePushbackDomainEvent(application,\n                messageUtility.getMessage(\"application.relation.related.rejected\", null), null));\n        log.info(\"returnForRejectedRelation > application_id={} returned: a related application was rejected\", application.getId());"
  },
  "invoiceTimeout": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/invoice/service/InvoiceServiceImpl.java",
    "line": 86,
    "code": "        } catch (InterruptedException | ExecutionException | TimeoutException e) {\n            throw new InternalServerErrorException(e.getMessage(), e.getCause(), CommonErrorCode.SYSTEM_ERROR.getValue());\n        }"
  },
  "invoiceTimeoutRuntime": {
    "repo": "MOH-Common-Library",
    "rev": "48d814c",
    "path": "src/main/java/kh/gov/esb/common_library/exception/InternalServerErrorException.java",
    "line": 5,
    "code": "public class InternalServerErrorException extends BaseException {\n    private static final Integer errorCode = HttpStatus.INTERNAL_SERVER_ERROR.value();\n\n    public InternalServerErrorException(String message) {\n        super(message, errorCode, errorCode);\n    }"
  },
  "renewAppShared": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/handler/ApplicationRenewHandler.java",
    "line": 14,
    "code": "@RequiredArgsConstructor\npublic class ApplicationRenewHandler {\n\n    private final ApplicationCoreHandler coreHandler;\n\n    public <TRequestDto extends BaseRenewalApplicationRequestDto> Application saveApplication(\n            Long applicationId,\n            TRequestDto requestDto,\n            Application existingApplication,\n            SpecificFieldProcessor<TRequestDto, Application> specificFieldProcessor\n    ) throws BaseException {\n\n        return coreHandler.saveApplication(applicationId, requestDto, existingApplication, (req, app) -> {\n\n            app.setProfileId(req.getProfileId());\n\n            // Execute the specific logic from strategy\n            if (specificFieldProcessor != null) {\n                specificFieldProcessor.process(req, app);\n            }\n        });\n    }\n\n    public Application submitApplication(Long applicationId, BiConsumer<BaseApplicationRequestDto, Map<String, Object>> specificValidationProcessor) throws BaseException {\n        return coreHandler.submitApplication(applicationId, specificValidationProcessor);\n    }"
  },
  "renewAppFactory": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/application/ApplicationStrategyFactory.java",
    "line": 21,
    "code": "\n    private final Map<String, ApplicationStrategy<?>> strategies;\n    private final ApplicationMapper applicationMapper;\n\n    @Autowired\n    public ApplicationStrategyFactory(Map<String, ApplicationStrategy<?>> strategies, ApplicationMapper applicationMapper) {\n        this.strategies = strategies;\n        this.applicationMapper = applicationMapper;\n    }\n\n    @SuppressWarnings(\"unchecked\")\n    public <T extends BaseApplicationRequestDto> ApplicationStrategy<T> getStrategy(String serviceCode) throws BaseException {\n        ApplicationStrategy<?> strategy = this.strategies.get(serviceCode);\n        if (strategy == null) {\n            throw new BaseException(\"Unsupported service type!\", HttpStatus.UNPROCESSABLE_ENTITY.value());\n        }\n        return (ApplicationStrategy<T>) strategy;\n    }\n"
  },
  "renewProfileShared": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/handler/BaseRenewHandler.java",
    "line": 27,
    "code": "    @Transactional\n    public <T extends RenewRequestDto> void handle(T requestDto, RenewHandlerHooks<T> hooks) throws NotFoundException {\n        Profile profile = profileRepository.findWithDetailsById(requestDto.getProfileId())\n                .orElseThrow(() -> new NotFoundException(\"Profile not found: \" + requestDto.getProfileId()));\n\n        validateRenewal(profile, requestDto);\n        hooks.applyRenewal(profile, requestDto);\n        profileRepository.saveAndFlush(profile);\n        regulatoryRegistrationService.syncAll(profile.getRegistrations());\n        hooks.publishEvents(profile, requestDto);\n    }\n\n    private <T extends RenewRequestDto> void validateRenewal(Profile profile, T requestDto) {\n        boolean hasRenewable = Optional.ofNullable(profile.getRegistrations())\n                .orElseGet(Collections::emptyList)\n                .stream()\n                .filter(r -> requestDto.getServiceCode() == null\n                        || requestDto.getServiceCode().equals(r.getServiceCode()))\n                .map(RegulatoryRegistration::getLicense)\n                .anyMatch(l -> l != null && l.isRenewable());\n        if (!hasRenewable) {\n            throw new ValidationException(\"No renewable licenses found for profile: \" + profile.getNo());\n        }\n    }"
  },
  "renewProfileFactory": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/LicenseStrategyFactory.java",
    "line": 60,
    "code": "    }\n\n    public BaseProfileResponseDto getProfileDetails(Profile profile) throws BaseException {\n        return getStrategy(profile.getService().getCode()).getProfileDetails(profile);\n    }\n\n    /**\n     * {@code { profile, license, detail }} for one license. The strategy is resolved by the"
  },
  "renewCodeScope": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/constant/ServiceCode.java",
    "line": 438,
    "code": "    /**\n     * =============================================================\n     *     REAGENT_PRODUCT (DR06)\n     * =============================================================\n     *  Product-level registration of reagent products (Product Number: one licence per product).\n     *  <pre>\n     *  GDHT-RG-L    Registration (DR06)\n     *  </pre>\n     *  Sub-service codes (DR06.01 - DR06.05) are proposed in the DR06 roadmap (decision D1) and are not\n     *  reserved here until the senior approves them.\n     */\n    public static final String REAGENT_LICENSE_REGISTRATION = \"GDHT-RG-L\";"
  },
  "amendmentAppFields": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/model/ApplicationReagentProduct.java",
    "line": 75,
    "code": "    @Column(name = \"manufacturer_name\")\n    private String manufacturerName;\n\n    @Column(name = \"manufacturer_address\", columnDefinition = \"text\")\n    private String manufacturerAddress;\n\n    @Column(name = \"manufacturer_country\")\n    private String manufacturerCountry;\n\n    @Column(name = \"mah_name\")\n    private String mahName;\n\n    @Column(name = \"mah_address\", columnDefinition = \"text\")\n    private String mahAddress;"
  },
  "amendmentProfileFields": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/model/ReagentProductLicenseDetail.java",
    "line": 89,
    "code": "    @Column(name = \"manufacturer_name\")\n    private String manufacturerName;\n\n    @Column(name = \"manufacturer_address\", columnDefinition = \"text\")\n    private String manufacturerAddress;\n\n    @Column(name = \"manufacturer_country\")\n    private String manufacturerCountry;\n\n    @Column(name = \"mah_name\")\n    private String mahName;\n\n    @Column(name = \"mah_address\", columnDefinition = \"text\")\n    private String mahAddress;"
  },
  "amendmentRegistrationStrategy": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/reagent/strategy/ReagentLicenseRegistrationStrategy.java",
    "line": 21,
    "code": "/** Bean name = service code: {@code ProfileKafkaConsumer} finds this strategy by {@code GDHT-RG-L}. */\n@Service(ServiceCode.REAGENT_LICENSE_REGISTRATION)\n@RequiredArgsConstructor\npublic class ReagentLicenseRegistrationStrategy implements\n        LicenseStrategy<ReagentRegisterRequestDto, ReagentProfileResponseDto>,\n        LicenseOperationStrategy, LicenseDetailOperation {\n\n    private final ReagentRegisterHandler registerHandler;\n    private final ReagentMapper mapper;\n    private final ReagentProductLicenseDetailRepository detailRepository;\n    private final LicenseDetailAssembler licenseDetailAssembler;\n\n    @Override\n    public void processApprovedMessage(ApplicationApprovedMessage message) throws BaseException {\n        registerHandler.handle(mapper.toRegisterRequestDto(message));\n    }\n\n    @Override\n    public void register(ReagentRegisterRequestDto requestDto) throws BaseException {\n        registerHandler.handle(requestDto);\n    }\n"
  },
  "amendmentAppStrategy": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/reagent/strategy/ReagentRegistrationApplicationStrategy.java",
    "line": 73,
    "code": "@Service(ServiceCode.REAGENT_LICENSE_REGISTRATION)\n@RequiredArgsConstructor\npublic class ReagentRegistrationApplicationStrategy implements ApplicationStrategy<ReagentRegistrationRequestDto> {"
  },
  "dr06TerminateShared": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/handler/BaseTerminateHandler.java",
    "line": 30,
    "code": "    @Transactional\n    public <T extends TerminateRequestDto> void handle(T requestDto, TerminateHandlerHooks<T> hooks) throws NotFoundException {\n        Profile profile = profileRepository.findWithDetailsById(requestDto.getProfileId())\n                .orElseThrow(() -> new NotFoundException(\"Profile not found: \" + requestDto.getProfileId()));\n\n        if (profile.getStatus() == ProfileStatus.TERMINATED) {\n            throw new ValidationException(\"Profile is already terminated: \" + profile.getNo());\n        }\n\n        profile.setStatus(ProfileStatus.TERMINATED);\n        Optional.ofNullable(profile.getRegistrations())\n                .orElseGet(Collections::emptyList)\n                .stream()\n                .map(RegulatoryRegistration::getLicense)\n                .filter(Objects::nonNull)\n                .filter(l -> l.getStatus().isOpen())\n                .forEach(l -> l.setStatus(LicenseStatus.TERMINATED));\n\n        profileRepository.saveAndFlush(profile);\n        regulatoryRegistrationService.syncAll(profile.getRegistrations());\n        hooks.publishEvents(profile, requestDto);\n    }\n}\n"
  },
  "dr06TerminateAppShared": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/handler/ApplicationTerminateHandler.java",
    "line": 14,
    "code": "@RequiredArgsConstructor\npublic class ApplicationTerminateHandler {\n\n    private final ApplicationCoreHandler coreHandler;\n\n    public <TRequestDto extends BaseTerminationApplicationRequestDto> Application saveApplication(\n            Long applicationId,\n            TRequestDto requestDto,\n            Application existingApplication,\n            SpecificFieldProcessor<TRequestDto, Application> specificFieldProcessor\n    ) throws BaseException {\n\n        return coreHandler.saveApplication(applicationId, requestDto, existingApplication, (req, app) -> {\n\n            app.setProfileId(req.getProfileId());\n\n            // Execute the specific logic from strategy\n            if (specificFieldProcessor != null) {\n                specificFieldProcessor.process(req, app);\n            }\n        });\n    }\n\n    public Application submitApplication(Long applicationId, BiConsumer<BaseApplicationRequestDto, Map<String, Object>> specificValidationProcessor) throws BaseException {\n        return coreHandler.submitApplication(applicationId, specificValidationProcessor);\n    }\n\n    public void validateSubmitApplication(Application application, BiConsumer<BaseApplicationRequestDto, Map<String, Object>> specificValidationProcessor) throws BaseException {\n        coreHandler.validateSubmitApplication(application, specificValidationProcessor);"
  },
  "freeSaleCodeScope": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/constant/ServiceCode.java",
    "line": 134,
    "code": "\n    /**\n     * =============================================================\n     *     FREE_SALE_CERTIFICATE (food products, FS03 / FS04)\n     *  =============================================================\n     *  <pre>\n     *  GDHT-FS-L  ពាក្យសុំវិញ្ញាបនបត្របញ្ជាក់ការដាក់លក់ផលិតផលចំណីអាហារ\n     *  GDHT-FS-R  ពាក្យសុំបន្តវិញ្ញាបនបត្របញ្ជាក់ការដាក់លក់ផលិតផលចំណីអាហារ\n     *  </pre>\n     */\n    public static final String FREE_SALE_CERTIFICATE_REGISTRATION = \"GDHT-FS-L\";\n    public static final String FREE_SALE_CERTIFICATE_RENEWAL      = \"GDHT-FS-R\";"
  },
  "freeSaleAppBean": {
    "repo": "MOH-Application",
    "rev": "3bd064ea",
    "path": "src/main/java/kh/gov/esb/application/modules/free_sale/strategy/FreeSaleRegistrationStrategy.java",
    "line": 34,
    "code": "@Service(ServiceCode.FREE_SALE_CERTIFICATE_REGISTRATION)\n@RequiredArgsConstructor\npublic class FreeSaleRegistrationStrategy implements ApplicationStrategy<FreeSaleRegistrationRequestDto> {"
  },
  "freeSaleProfileBean": {
    "repo": "MOH-Profile",
    "rev": "c4dacbe",
    "path": "src/main/java/kh/gov/esb/profile/modules/freesale/strategy/FreeSaleLicenseRegistrationStrategy.java",
    "line": 25,
    "code": "@Service(ServiceCode.FREE_SALE_CERTIFICATE_REGISTRATION)\n@RequiredArgsConstructor\npublic class FreeSaleLicenseRegistrationStrategy\n        implements LicenseStrategy<FreeSaleRegisterRequestDto, FreeSaleProfileResponseDto>,"
  },
  "tmRequest": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/traditional_medicine/dto/request/TraditionalMedicineProductRequestDto.java",
    "line": 18,
    "code": " * One DR08 product. Fields 2–8 (product name, composition, dosage form, pack size, manufacturer) are not\n * sent: they belong to the selected DR07 brand-name licence, which is checked on submit.\n */\n@Data\n@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)\npublic class TraditionalMedicineProductRequestDto {\n\n    /** Field 1 (Local / Import), per product: it decides the origin digit of this product's licence number. */\n    @NotNull(groups = {SubmitValidation.class})\n    private TraditionalMedicineApplicationType applicationType;\n\n    /** The DR07 (GDHT-PBN-L) licence that holds this product's fields 2–8. */\n    @NotNull(groups = {SubmitValidation.class})\n    private Long brandNameLicenseId;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 255)\n    private String mahName;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 1000)\n    private String mahAddress;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 255)\n    private String mahCountry;\n\n    @NotNull(groups = {SubmitValidation.class})\n    @Positive(groups = {SubmitValidation.class})\n    private Integer shelfLifeMonths;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 1000)\n    private String intendedUse;\n\n    /**\n     * This product's own documents (keys in {@code TraditionalMedicineRegistrationApplicationStrategy.PRODUCT_DOCUMENT_KEYS}).\n     * The required keys are checked per product on submit; shared documents go on the application.\n     */\n    private List<@Valid AttachmentDto> attachments;\n}\n"
  },
  "tmSave": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/traditional_medicine/strategy/TraditionalMedicineRegistrationApplicationStrategy.java",
    "line": 86,
    "code": "    @Override\n    @Transactional\n    public Application saveApplication(\n            Long applicationId,\n            TraditionalMedicineRegistrationRequestDto requestDto,\n            @Nullable Application existingApplication) throws BaseException {\n        Map<String, Object> errors = new java.util.LinkedHashMap<>();\n        validateAttachmentPlacement(requestDto.getAttachments(), true, \"attachments\", errors);\n        var body = requestDto.getTraditionalMedicine();\n        if (body != null && body.getProducts() != null) {\n            for (int i = 0; i < body.getProducts().size(); i++) {\n                var product = body.getProducts().get(i);\n                if (product != null) validateAttachmentPlacement(product.getAttachments(), false,\n                        PRODUCTS + \"[\" + i + \"].attachments\", errors);\n            }\n        }\n        if (!errors.isEmpty()) throw new CustomValidationException(\"application.validation.failed\", errors);\n\n        Application saved = registerHandler.saveApplication(applicationId, requestDto, existingApplication,\n                (req, app) -> {\n                    TraditionalMedicineRequestDto tm = req.getTraditionalMedicine();\n                    if (tm != null && tm.getProducts() != null && !tm.getProducts().isEmpty()) {\n                        // The product name lives on the DR07 brand-name licence, not on the DR08 product.\n                        Object productName = profileAdapter\n                                .getPharmacyBrandName(tm.getProducts().get(0).getBrandNameLicenseId())\n                                .get(\"product_name\");\n                        if (productName instanceof String name && !name.isBlank()) {\n                            app.setApplicationNameEn(name);\n                        }\n                    }\n                });\n        if (requestDto.getTraditionalMedicine() != null) {\n            saveDetail(saved, requestDto.getTraditionalMedicine());\n            saveProducts(saved, requestDto.getTraditionalMedicine().getProducts());\n        }\n        return saved;\n    }\n\n    @Override\n    public Application submitApplication(Long applicationId) throws BaseException {\n        return registerHandler.submitApplication(applicationId, buildValidationProcessor(applicationId));\n    }\n\n    @Override\n    public void validateSubmitApplication(Application application) throws BaseException {\n        registerHandler.validateSubmitApplication(application, buildValidationProcessor(application.getId()));\n    }\n\n    @Override\n    public void sendNotifications(Application application, ApplicationStrategyAction action) {\n        coreHandler.sendNotifications(application, action);"
  },
  "tmReplace": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/traditional_medicine/strategy/TraditionalMedicineRegistrationApplicationStrategy.java",
    "line": 218,
    "code": "            productDto.setAttachments(attachmentResolutionService.resolve(productDto.getAttachments()));\n            ApplicationTraditionalMedicineProduct product = detailMapper.toProduct(productDto);\n            product.setApplication(application);\n            productRepository.save(product);\n        }\n    }\n\n    private BiConsumer<BaseApplicationRequestDto, Map<String, Object>> buildValidationProcessor(Long applicationId) {\n        return (requestDto, fieldErrors) -> {\n            validateAttachmentPlacement(requestDto.getAttachments(), true, \"attachments\", fieldErrors);\n            ApplicationTraditionalMedicineDetail detail = detailRepository.findById(applicationId).orElse(null);\n            if (detail == null) {\n                fieldErrors.put(ROOT, \"not.null\");\n                return;\n            }\n            collectViolations(detailMapper.toRequestDto(detail), ROOT, fieldErrors);\n            formDataHelper.validatePharmaceuticalPrerequisiteLicense(\n                    detail.getPrerequisiteProfileId(), fieldErrors, ROOT + \".prerequisiteProfileId\");\n"
  },
  "tmValidate": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/traditional_medicine/strategy/TraditionalMedicineRegistrationApplicationStrategy.java",
    "line": 237,
    "code": "            List<ApplicationTraditionalMedicineProduct> products = productRepository.findByApplicationIdOrderByIdAsc(applicationId);\n            if (products.isEmpty()) {\n                fieldErrors.put(PRODUCTS, \"not.null\");\n                return;\n            }\n            for (int i = 0; i < products.size(); i++) {\n                collectViolations(detailMapper.toProductRequestDto(products.get(i)), PRODUCTS + \"[\" + i + \"]\", fieldErrors);\n                validateProductAttachments(products.get(i), PRODUCTS + \"[\" + i + \"].attachments\", fieldErrors);\n            }\n            // The core service-document check reads the application's attachments only. Add every product's\n            // files so it does not report the product documents missing at the root (as DR07 does).\n            mergeProductAttachments(requestDto, products);\n\n            // A missing licence id is already reported per product above; check only the ids that were given.\n            List<Long> brandNameLicenseIds = products.stream()\n                    .map(ApplicationTraditionalMedicineProduct::getBrandNameLicenseId)\n                    .filter(Objects::nonNull)\n                    .toList();\n            if (!brandNameLicenseIds.isEmpty()) {\n                formDataHelper.validatePharmacyBrandNameLicenseIds(brandNameLicenseIds, fieldErrors);\n            }\n        };\n    }\n\n    /** Each product must carry every required product document itself; another product's file does not count. */\n    private void validateProductAttachments(ApplicationTraditionalMedicineProduct product, String errorKey,\n                                            Map<String, Object> fieldErrors) {\n        List<AttachmentDto> attachments = product.getAttachments() != null\n                ? attachmentMapper.toAttachmentDtos(product.getAttachments())\n                : List.of();\n        validateAttachmentPlacement(attachments, false, errorKey, fieldErrors);\n        List<MissingAttachmentItemResponseDto> missing;\n        try {\n            missing = serviceDocumentGroupService\n                    .validateAttachmentsByServiceCode(ServiceCode.TRADITIONAL_MEDICINE_LICENSE_REGISTRATION, attachments)\n                    .getMissingAttachments().stream()\n                    .filter(item -> !SHARED_DOCUMENT_KEY.equals(item.getKey()))\n                    .toList();\n        } catch (BaseException ex) {\n            fieldErrors.putIfAbsent(errorKey, ex.getMessage());\n            return;\n        }\n        if (!missing.isEmpty()) {\n            MissingAttachmentResponseDto response = new MissingAttachmentResponseDto();"
  },
  "tmPayload": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/traditional_medicine/strategy/TraditionalMedicineRegistrationApplicationStrategy.java",
    "line": 323,
    "code": "                                                                 List<ApplicationTraditionalMedicineProduct> products) {\n        Map<String, Object> m = new HashMap<>();\n        m.put(\"prerequisite_profile_id\", detail.getPrerequisiteProfileId());\n        List<Map<String, Object>> productList = new ArrayList<>();\n        for (ApplicationTraditionalMedicineProduct p : products) {\n            productList.add(buildProductFormData(p));\n        }\n        m.put(\"products\", productList);\n        return m;\n    }\n\n    private Map<String, Object> buildProductFormData(ApplicationTraditionalMedicineProduct p) {\n        Map<String, Object> m = new HashMap<>();\n        m.put(\"application_type\", p.getApplicationType() != null ? p.getApplicationType().name() : null);\n        // Fields 2–8 are not sent: MOH-Profile reads them from this DR07 licence when it issues the licence.\n        m.put(\"brand_name_license_id\", p.getBrandNameLicenseId());\n        m.put(\"mah_name\", p.getMahName());\n        m.put(\"mah_address\", p.getMahAddress());\n        m.put(\"mah_country\", p.getMahCountry());\n        m.put(\"shelf_life_months\", p.getShelfLifeMonths());\n        m.put(\"intended_use\", p.getIntendedUse());\n        m.put(\"attachments\", p.getAttachments());\n        return m;\n    }\n}\n"
  },
  "tmBilling": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/traditional_medicine/strategy/TraditionalMedicineRegistrationApplicationStrategy.java",
    "line": 146,
    "code": "                .build());\n    }\n\n    @Override\n    public BaseApplicationResponseDto mapToResponseDto(Application application) {\n        TraditionalMedicineRegistrationApplicationResponseDto dto = applicationMapper\n                .toTraditionalMedicineRegistrationApplicationResponseDto(application);\n        detailRepository.findById(application.getId()).ifPresent(detail -> {\n            TraditionalMedicineResponseDto tm = detailMapper.toResponseDto(detail);\n            tm.setProducts(productRepository.findByApplicationIdOrderByIdAsc(application.getId()).stream()\n                    .map(detailMapper::toProductResponseDto)\n                    .toList());\n            dto.setTraditionalMedicine(tm);\n        });\n        return dto;\n    }\n\n    @Override\n    public BaseSlimApplicationResponseDto mapToSlimResponseDto(Application application) {\n        return applicationMapper.toSlimTraditionalMedicineRegistrationApplicationResponseDto(application);\n    }\n\n    @Override\n    public Map<String, Object> buildApprovedFormData(Application application) {\n        Map<String, Object> data = formDataHelper.buildCommonFormData(application);\n        formDataHelper.enrichWithAttachments(data, application);\n        data.put(\"application_submitted_date\", application.getSubmittedDate());\n        data.put(\"application_first_submitted_date\", application.getFirstSubmittedDate());\n        detailRepository.findById(application.getId()).ifPresent(detail -> data.put(\"traditional_medicine\",\n                buildTraditionalMedicineFormData(detail,\n                        productRepository.findByApplicationIdOrderByIdAsc(application.getId()))));\n        return data;\n    }\n\n    @Override\n    public ApplicationApprovedMessage toApplicationApprovedMessage(Application application, String formData) {\n        return applicationApprovedMapper\n                .toApplicationApprovedMessageByTraditionalMedicineProductRegistration(application, formData);\n    }\n"
  },
  "tmHandler": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/traditionalmedicine/strategy/handler/TraditionalMedicineRegisterHandler.java",
    "line": 49,
    "code": "    private final PharmacyBrandNameLicenseDetailRepository brandNameDetailRepository;\n\n    public void handle(TraditionalMedicineRegisterRequestDto requestDto) throws NotFoundException {\n        fillFromBrandNameLicences(requestDto);\n        registerHandler.handle(requestDto, this);\n    }\n\n    /**\n     * MOH-Application no longer sends a product's name, composition, dosage form, pack size and manufacturer:\n     * they are copied here from the DR07 brand-name licence named by {@code brand_name_license_id}, so the\n     * licence detail and certificate keep a snapshot. A product whose licence is not found keeps what the\n     * message carried (form data approved before the change).\n     */\n    private void fillFromBrandNameLicences(TraditionalMedicineRegisterRequestDto requestDto) {\n        TraditionalMedicineDto traditionalMedicine = requestDto.getTraditionalMedicine();\n        if (traditionalMedicine == null || traditionalMedicine.getProducts() == null) {\n            return;\n        }\n        List<TraditionalMedicineProductDto> products = traditionalMedicine.getProducts();\n        List<Long> licenseIds = products.stream()\n                .map(TraditionalMedicineProductDto::getBrandNameLicenseId)\n                .filter(java.util.Objects::nonNull)\n                .distinct()\n                .toList();\n        if (licenseIds.isEmpty()) {\n            return;\n        }\n        java.util.Map<Long, PharmacyBrandName> byLicenseId = new java.util.HashMap<>();\n        for (PharmacyBrandNameLicenseDetail detail : brandNameDetailRepository.findAllByLicenseIdIn(licenseIds)) {\n            if (detail.getBrandNames() != null && !detail.getBrandNames().isEmpty()) {\n                byLicenseId.put(detail.getRegistration().getLicense().getId(), detail.getBrandNames().getFirst());\n            }\n        }\n        for (TraditionalMedicineProductDto product : products) {\n            PharmacyBrandName brandName = byLicenseId.get(product.getBrandNameLicenseId());\n            if (brandName == null) {\n                continue;\n            }\n            product.setProductName(brandName.getProductName());\n            product.setCompositionAndStrength(brandName.getInnAndStrength());\n            product.setDosageForm(brandName.getForm());\n            product.setPackSize(brandName.getPackSize());\n            product.setManufacturerName(brandName.getManufacturerEn());\n            product.setManufacturerAddress(formatAddress(brandName.getAddress()));\n            product.setManufacturerCountry(brandName.getCountry());\n        }\n        if (requestDto.getApplicationNameEn() == null && !products.isEmpty()) {\n            requestDto.setApplicationNameEn(products.getFirst().getProductName());\n        }\n    }\n\n    /** The DR07 manufacturer address is structured; DR08 stores it as one line. */"
  },
  "tmLoop": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/traditionalmedicine/strategy/handler/TraditionalMedicineRegisterHandler.java",
    "line": 129,
    "code": "        List<TraditionalMedicineProductDto> products = traditionalMedicine.getProducts();\n        if (products == null || products.isEmpty()) {\n            throw new NotFoundException(\"DR08 approved message carries no traditional_medicine.products\");\n        }\n        // Checked before any licence is built: every product's number needs an origin digit. The origin is\n        // per product; form data approved before that change carries it once on the application.\n        for (TraditionalMedicineProductDto product : products) {\n            if (product.getApplicationType() == null && traditionalMedicine.getApplicationType() == null) {\n                throw new NotFoundException(\"DR08 approved message carries no product origin\");\n            }\n        }\n        Profile profile = ctx.getProfile();\n\n        // One registration, licence and product number per product (DR01 GDHT-CN-L pattern).\n        for (TraditionalMedicineProductDto product : products) {\n            // The licence number's origin digit is read from the request's current product.\n            requestDto.setCurrentProduct(product);\n            RegulatoryRegistration registration = licenseBuilder.buildNew(\n                    LicenseBuildContext.<TraditionalMedicineRegisterRequestDto, TraditionalMedicineCertificateType>builder()\n                            .profile(profile)\n                            .item(TraditionalMedicineCertificateType.TRADITIONAL_MEDICINE_LICENSE)\n                            .operationType(LicenseOperationType.ISSUE)\n                            .requestDto(requestDto)\n                            .build());\n            regulatoryRegistrationService.save(registration);\n            profile.addRegistration(registration);\n\n            TraditionalMedicineProductLicenseDetail detail = mapper.toDetail(traditionalMedicine, product);\n            detail.setProfile(profile);\n            detail.setRegistration(registration);\n            ctx.getDetails().getDetails().add(detailRepository.save(detail));\n            log.info(\"[GDHT-TM-L] Issued licence {} for product '{}' on profile {}\",\n                    registration.getLicense().getLicenseNo(), product.getProductName(), profile.getNo());\n        }\n    }\n\n    @Override\n    public void publishEvents(LicenseRegistrationContext<TraditionalMedicineDetailsContext> ctx,\n                              TraditionalMedicineRegisterRequestDto requestDto) {\n        Profile profile = ctx.getProfile();\n        applicationEventPublisher.publishEvent(\n                new ProfileCreatedDomainEvent(ctx.getApplicationId(), ctx.getApplicationNo(), profile));\n\n        List<RegulatoryRegistration> registrations = ctx.getChangedRegistrations();\n        if (registrations == null || registrations.isEmpty()) {\n            return;\n        }\n        List<License> licenses = registrations.stream().map(RegulatoryRegistration::getLicense).toList();\n        certificatePublishStrategy.publishCertificateOperationEvent(\n                LicenseOperationType.ISSUE, profile, requestDto.getServiceCode(), licenses);\n    }\n}\n"
  },
  "tmSnapshot": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/traditionalmedicine/mapper/TraditionalMedicineMapper.java",
    "line": 95,
    "code": "    // ---------------------------------------------------------------- dto <-> entity (by hand)\n    /**\n     * One product's detail. The prerequisite profile comes from the application-level block; the origin is\n     * the product's own, falling back to the application-level one for form data approved before the move.\n     */\n    public TraditionalMedicineProductLicenseDetail toDetail(TraditionalMedicineDto application,\n                                                           TraditionalMedicineProductDto dto) {\n        TraditionalMedicineProductLicenseDetail e = new TraditionalMedicineProductLicenseDetail();\n        e.setApplicationType(dto.getApplicationType() != null\n                ? dto.getApplicationType() : application.getApplicationType());\n        e.setPrerequisiteProfileId(application.getPrerequisiteProfileId());\n        e.setBrandNameLicenseId(dto.getBrandNameLicenseId());\n        e.setProductName(dto.getProductName());\n        e.setCompositionAndStrength(dto.getCompositionAndStrength());\n        e.setDosageForm(dto.getDosageForm());\n        e.setPackSize(dto.getPackSize());\n        e.setManufacturerName(dto.getManufacturerName());\n        e.setManufacturerAddress(dto.getManufacturerAddress());\n        e.setManufacturerCountry(dto.getManufacturerCountry());\n        e.setMahName(dto.getMahName());\n        e.setMahAddress(dto.getMahAddress());\n        e.setMahCountry(dto.getMahCountry());\n        e.setShelfLifeMonths(dto.getShelfLifeMonths());\n        e.setIntendedUse(dto.getIntendedUse());\n        e.setAttachments(dto.getAttachments() != null ? attachmentMapper.fromAttachmentDtos(dto.getAttachments()) : null);\n        return e;\n    }\n\n    public TraditionalMedicineProductDto toProductDto(TraditionalMedicineProductLicenseDetail e) {\n        if (e == null) {\n            return null;\n        }"
  },
  "tmEntity": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/traditionalmedicine/model/TraditionalMedicineProductLicenseDetail.java",
    "line": 35,
    "code": "@Entity\n@Table(name = \"traditional_medicine_license_details\")\npublic class TraditionalMedicineProductLicenseDetail extends BaseAuditable<String> {\n\n    @Id\n    @Column(name = \"registration_id\")\n    private Long id;\n\n    @JsonIgnore\n    @MapsId\n    @OneToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = \"registration_id\")\n    private RegulatoryRegistration registration;\n\n    @ManyToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = \"profile_id\", referencedColumnName = \"id\")\n    private Profile profile;\n\n    @Enumerated(EnumType.STRING)\n    private TraditionalMedicineApplicationType applicationType;\n\n    /** The applicant's TR01/TR07 establishment profile checked on submit (copied from the application). */\n    private Long prerequisiteProfileId;\n\n    /** The DR07 brand-name licence this product's fields 2–8 were filled from. */\n    private Long brandNameLicenseId;\n\n    private String productName;\n\n    @Column(length = 2000)\n    private String compositionAndStrength;\n\n    private String dosageForm;\n    private String packSize;\n    private String manufacturerName;\n\n    @Column(length = 1000)\n    private String manufacturerAddress;\n\n    private String manufacturerCountry;\n    private String mahName;\n\n    @Column(length = 1000)\n    private String mahAddress;\n\n    private String mahCountry;\n    private Integer shelfLifeMonths;\n\n    @Column(length = 1000)\n    private String intendedUse;\n\n    /** This product's own documents from the approved application; shared documents stay on the profile. */\n    @Type(JsonType.class)\n    @JdbcTypeCode(SqlTypes.JSON)\n    @Column(name = \"attachments\", columnDefinition = \"jsonb\")\n    private List<Attachment> attachments;\n}\n"
  },
  "tmHook": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/handler/hook/RegisterHandlerHooks.java",
    "line": 9,
    "code": "public interface RegisterHandlerHooks<T extends RegisterRequestDto, D> {\n    D initDetails(T requestDto);\n\n    default Profile resolveProfile(T requestDto, BaseRegisterHandler base) throws NotFoundException {\n        return base.getOrCreateNewProfile(requestDto);\n    }\n\n    void processLicenses(LicenseRegistrationContext<D> ctx, T requestDto) throws NotFoundException;\n"
  },
  "tmResolver": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/handler/BaseRegisterHandler.java",
    "line": 139,
    "code": "    public Profile getOrCreateNewProfile(RegisterRequestDto requestDto) {\n        return getOrCreateNewProfile(requestDto, requestDto.getServiceCode());\n    }\n\n    public Profile getOrCreateNewProfile(RegisterRequestDto requestDto, String serviceCode) {\n        String singleId = normalizeId(requestDto.getCompany() == null ? null : requestDto.getCompany().getSingleId());\n        String identityNumber = normalizeId(requestDto.getLicensee() == null ? null : requestDto.getLicensee().getIdentityNumber());\n        return getOrCreateNewProfile(requestDto, serviceCode, singleId, identityNumber);\n    }\n\n    public Profile getOrCreateNewProfile(RegisterRequestDto requestDto, String serviceCode, String singleId, String identityNumber) {\n        if (serviceCode == null || (singleId == null && identityNumber == null)) {\n            return createNewProfile(requestDto);\n        }\n\n        Optional<Profile> companyProfile = singleId != null\n                ? profileRepository.findFirstByCompany_SingleIdOrderByIdAsc(singleId)\n                : profileRepository.findFirstByLicensee_IdentityNumberOrderByIdAsc(identityNumber);\n\n        return companyProfile\n                .filter(profile -> !regulatoryRegistrationRepository.existsByProfile_IdAndServiceCode(profile.getId(), serviceCode))\n                .orElseGet(() -> createNewProfile(requestDto));\n    }\n\n    private static String normalizeId(String value) {\n        return value == null || value.isBlank() ? null : value;\n    }"
  },
  "tmTx": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/handler/BaseRegisterHandler.java",
    "line": 71,
    "code": "    @Transactional\n    public <T extends RegisterRequestDto, D> void handle(T requestDto, RegisterHandlerHooks<T, D> hooks) throws NotFoundException {\n        LicenseRegistrationContext<D> ctx = LicenseRegistrationContext.<D>builder()\n                .applicationId(requestDto.getApplicationId())\n                .applicationNo(requestDto.getApplicationNo())\n                .applicationSubmittedDate(requestDto.getApplicationSubmittedDate())\n                .applicationFirstSubmittedDate(requestDto.getApplicationFirstSubmittedDate())\n                .serviceCode(requestDto.getServiceCode())\n                .details(hooks.initDetails(requestDto))\n                .build();\n\n        ctx.setProfile(hooks.resolveProfile(requestDto, this));\n        enrichProfile(requestDto, ctx);\n\n        if (ctx.getProfile().getProfileType() == null) {\n            ctx.getProfile().setProfileType(resolveProfileType(requestDto));\n        }\n\n        if (ctx.getProfile().getId() == null) {\n            ctx.setProfile(profileRepository.save(ctx.getProfile()));\n        }\n\n        if (ctx.getProfile().getApplicant() != null) {\n            ctx.getProfile().getApplicant().setProfile(ctx.getProfile());\n        }\n\n        hooks.processLicenses(ctx, requestDto);\n        captureOperationTypes(ctx);\n        ctx.setProfile(profileRepository.saveAndFlush(ctx.getProfile()));\n        captureChangedRegistrations(ctx);\n        regulatoryRegistrationService.syncAll(ctx.getChangedRegistrations());\n        hooks.publishEvents(ctx, requestDto);\n    }\n\n    private <T extends RegisterRequestDto, D> void enrichProfile(T requestDto, LicenseRegistrationContext<D> ctx) {\n        Profile profile = ctx.getProfile();\n        if (requestDto.getApprovedDate() != null) {\n            profile.setApprovedDate(Instant.parse(requestDto.getApprovedDate()));\n        }\n        if (requestDto.getAttachments() != null && !requestDto.getAttachments().isEmpty()) {\n            profile.setAttachments(attachmentMapper.fromAttachmentDtos(requestDto.getAttachments()));\n        }\n        if (requestDto.getCompany() != null) {\n            profile.setCompany(companyProcessor.process(companyMapper.fromCompanyDto(requestDto.getCompany())));\n        }\n        if (requestDto.getApplicant() != null) {\n            EntityProcessor<Applicant> applicantProcessor = entityProcessorFactory.createApplicantProcessor(requestDto.getUserId());\n            profile.addApplicant(applicantProcessor.process(applicantMapper.fromApplicantDto(requestDto.getApplicant())));\n        }\n        if (requestDto.getLicensee() != null) {\n            profile.setLicensee(licenseeProcessor.process(licenseeMapper.fromLicenseeDto(requestDto.getLicensee())));\n        }\n        setProfileNames(profile, requestDto);\n    }\n\n    public Profile createNewProfile(RegisterRequestDto requestDto) {\n        Profile profile = new Profile();\n        profile.setNo(sequenceService.next(SequenceKey.PROFILE.getKey()));\n        profile.setStatus(ProfileStatus.ACTIVE);\n        profile.setService(serviceMapper.fromServiceDto(requestDto.getService()));\n        profile.setLicenseeType(requestDto.getLicenseeType());\n        Integer deptId = requestDto.getDepartmentId();\n        profile.setDepartmentId(deptId);\n        profile.setUserId(requestDto.getUserId());\n        profile.setCreatedBy(requestDto.getUserId());\n        return profile;\n    }"
  },
  "tmOrigin": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/traditionalmedicine/dto/operation/TraditionalMedicineRegisterRequestDto.java",
    "line": 28,
    "code": "    private TraditionalMedicineProductDto currentProduct;\n\n    /**\n     * The current product's Application Type (LOCAL / IMPORT) decides the origin digit of its number.\n     * Form data approved before the origin moved onto the product carries it once on the application;\n     * that value is used when the product has none.\n     */\n    @Override\n    public ProductOrigin productOrigin() {\n        TraditionalMedicineApplicationType type = currentProduct != null ? currentProduct.getApplicationType() : null;\n        if (type == null && traditionalMedicine != null) {\n            type = traditionalMedicine.getApplicationType();\n        }\n        if (type == null) {\n            return null;\n        }\n        return switch (type) {\n            case LOCAL -> ProductOrigin.LOCAL;\n            case IMPORT -> ProductOrigin.IMPORT;\n        };\n    }\n}\n"
  },
  "tmSubmit": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 341,
    "code": "    public SubmitApplicationResult submitApplication(Long applicationId, boolean forcePaymentFirst, Long facilityApplicationId, Long relationApplicationId, String trackingNo) throws BaseException {\n        Application application = getApplication(applicationId, authenticationFacade.getPublicUserId())\n                .orElseThrow(() -> new NotFoundException(\"application.not.found\"));\n\n        // Only a first submit is gated: returned or awaiting-payment applications are already in progress.\n        if (application.getStatus() == ApplicationStatus.DRAFT) {\n            serviceAvailabilityGate.assertOpen(application);\n        }\n\n        application.assignTrackingNo(resolveTrackingNo(application, trackingNo));\n\n        if (facilityApplicationId != null) {\n            application.setFacilityApplicationId(facilityApplicationId);\n        }\n\n        ApplicationStrategy strategy = applicationStrategyFactory.getStrategy(application.getServiceCode());\n\n        strategy.validateSubmitApplication(application);\n        // Configurable eligibility/window/prerequisite/reconciliation gate for RENEW/TRANSFER/UPDATE\n        // service codes — a no-op (defaults to pass) for services with no operation_rule_configs rows.\n        operationGate.assertSubmittable(application);\n        // service_relation_rules: link and validate the applications this one depends on — a no-op for services without rules.\n        applicationRelationService.linkForSubmission(application, relationApplicationId != null ? List.of(relationApplicationId) : List.of());\n\n        if (application.isPaymentSettled()) {\n            return finalizeSubmission(application, strategy);\n        }\n\n        boolean paymentRequired = application.isAwaitingPayment() || forcePaymentFirst || reviewService.isPaymentStep(applicationId);\n\n        if (paymentRequired) {\n            List<ApplicationRequestServiceDto> items = strategy.getApplicationRequestServices(application);\n\n            application.setStatus(ApplicationStatus.AWAITING_PAYMENT);\n            application.setPaymentStatus(ApplicationPaymentStatus.PENDING);\n            application.setPaymentContext(PaymentContext.SUBMISSION);\n            application = applicationRepository.saveAndFlush(application);\n\n            InvoiceResponseDto invoice = invoiceService.issueInvoice(application, items);\n\n            if (invoice.isFreeOrWaived()) {\n                return SubmitApplicationResult.submitted(application);\n            }\n\n            return SubmitApplicationResult.awaitingPayment(application, invoice);\n        }\n\n        return finalizeSubmission(application, strategy);"
  },
  "tmFinalize": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/application/service/ApplicationServiceImpl.java",
    "line": 421,
    "code": "    private SubmitApplicationResult finalizeSubmission(Application application, ApplicationStrategy strategy) {\n        Instant now = Instant.now();\n        ApplicationStatus submittedStatus = application.getStatus() == ApplicationStatus.RETURNED ? ApplicationStatus.RE_SUBMITTED : ApplicationStatus.SUBMITTED;\n        application.setSubmittedDate(now);\n        if (application.getFirstSubmittedDate() == null) {\n            application.setFirstSubmittedDate(now);\n        }\n\n        // Every path into review (direct submit and paid-after-submit) passes here, so this is the one relation gate.\n        switch (applicationRelationService.evaluate(application)) {\n            case WAITING -> {\n                // Held: no ApplicationSubmittedDomainEvent, so the review service never sees it until released.\n                application.setStatus(ApplicationStatus.WAITING_RELATION);\n                application = applicationRepository.save(application);\n                applicationEventPublisher.publishEvent(new ApplicationStatusUpdatedDomainEvent(application));\n                return SubmitApplicationResult.submitted(application);\n            }\n            case RELATED_REJECTED -> {\n                application = applicationRepository.save(application);\n                returnForRejectedRelation(application);\n                return SubmitApplicationResult.submitted(application);\n            }\n            default -> {\n                // OPEN: fall through to review.\n            }\n        }\n\n        application.setStatus(submittedStatus);\n        application = applicationRepository.save(application);\n        strategy.sendNotifications(application, ApplicationStrategyAction.SUBMIT);\n        return SubmitApplicationResult.submitted(application);\n    }\n\n    /**\n     * Called once an application reaches a final status: releases the applications held in WAITING_RELATION on it\n     * (to review once all their prerequisites are met) or hands them back to the applicant if it was rejected.\n     */\n    private void processWaitingDependents(Application related) {\n        for (Application dependent : applicationRelationService.findWaitingDependents(related.getId())) {\n            try {"
  },
  "tmApprovalEvent": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/event/listener/ApplicationEventListener.java",
    "line": 66,
    "code": "    @TransactionalEventListener\n    public void handleApplicationApprovedEvent(ApplicationApprovedDomainEvent domainEvent) {\n        try {\n            producer.produceApplicationApprovedEvent(domainEvent);\n        } catch (Exception e) {\n            log.error(\"Failed to produce ApplicationApprovedMessage for application: {}\",\n                    domainEvent.getApplication().getApplicationNo(), e);\n        }\n    }"
  },
  "tmIssueEvent": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/kafka/producer/ProfileKafkaProducer.java",
    "line": 117,
    "code": "    @TransactionalEventListener\n    public void produceProfileLicenseOperationEvent(ProfileLicenseOperationEvent domainEvent) {\n        log.info(\"ProfileLicenseOperationEvent: {}\", domainEvent);\n        ProfileLicenseOperationMessage message = profileMapper.toProfileLicenseOperationMessage(domainEvent, serviceName);\n        publishWithOutbox(String.valueOf(domainEvent.profileId()), \"PROFILE_LICENSE_OPERATION\",\n                kafkaConfiguration.getProfileLicenseOperationTopic(), message);\n    }"
  },
  "hsRequest": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/health_supporting_product/dto/HealthSupportingProductRequestDto.java",
    "line": 19,
    "code": "public class HealthSupportingProductRequestDto {\n\n    /**\n     * This product's own documents (keys in {@code HealthSupportingRegistrationApplicationStrategy.PRODUCT_DOCUMENT_KEYS}).\n     * The required keys are checked per product on submit; shared documents go on the application.\n     */\n    private List<@Valid AttachmentDto> attachments;\n\n    @NotNull(groups = {SubmitValidation.class})\n    private HealthSupportingApplicationType applicationType;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 255)\n    private String productName;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 2000)\n    private String compositionAndStrength;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 255)\n    private String dosageForm;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 255)\n    private String packSize;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 255)\n    private String manufacturerName;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 1000)\n    private String manufacturerAddress;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 255)\n    private String manufacturerCountry;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 255)\n    private String mahName;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 1000)\n    private String mahAddress;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 255)\n    private String mahCountry;\n\n    @NotNull(groups = {SubmitValidation.class})\n    @Positive(groups = {SubmitValidation.class})\n    private Integer shelfLifeMonths;\n\n    @NotBlank(groups = {SubmitValidation.class})\n    @Size(max = 1000)\n    private String intendedUse;\n}"
  },
  "hsSave": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/health_supporting_product/strategy/HealthSupportingRegistrationApplicationStrategy.java",
    "line": 65,
    "code": "\n    /**\n     * Documents that describe one product, uploaded on that product. Every other GDHT-HS-L document\n     * (application form, establishment decision, letter of authorization) is shared and stays on the\n     * application. Required flags come from the service-document seed.\n     */\n    static final Set<String> PRODUCT_DOCUMENT_KEYS = Set.of(\n            \"free_sale_certificate\", \"smpc_product_information\", \"registration_other_countries\",\n            \"technical_documents\", \"product_photo\");\n\n    private final ApplicationCoreHandler coreHandler;\n    private final ApplicationRegisterHandler registerHandler;\n    private final ApplicationMapper applicationMapper;\n    private final ApplicationHealthSupportingProductDetailMapper detailMapper;\n    private final ApplicationHealthSupportingDetailRepository detailRepository;\n    private final ApplicationHealthSupportingProductDetailRepository productRepository;\n    private final Validator validator;\n    private final ApplicationFormDataHelper formDataHelper;\n    private final ApplicationApprovedMapper applicationApprovedMapper;\n    private final HealthSupportingCertificateDataBuilder certificateDataBuilder;\n    private final AttachmentResolutionService attachmentResolutionService;\n    private final AttachmentMapper attachmentMapper;\n    private final ServiceDocumentGroupService serviceDocumentGroupService;\n\n    @Override\n    @Transactional\n    public Application saveApplication(\n            Long applicationId,\n            HealthSupportingRegistrationRequestDto requestDto,\n            @Nullable Application existingApplication) throws BaseException {\n        Application saved = registerHandler.saveApplication(applicationId, requestDto, existingApplication,\n                (req, app) -> {\n                    HealthSupportingRequestDto hs = req.getHealthSupportingProduct();\n                    if (hs != null && hs.getProducts() != null && !hs.getProducts().isEmpty()\n                            && hs.getProducts().get(0) != null) {\n                        // The application is named after its first product.\n                        String productName = hs.getProducts().get(0).getProductName();\n                        app.setApplicationNameEn(productName);\n                        // Invoice issuance uses the Khmer application name when there is no company.\n                        app.setApplicationNameKh(productName);\n                    }\n                });\n        if (requestDto.getHealthSupportingProduct() != null) {\n            saveDetail(saved, requestDto.getHealthSupportingProduct());\n            saveProducts(saved, requestDto.getHealthSupportingProduct().getProducts());\n        }"
  },
  "hsBill": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/health_supporting_product/strategy/HealthSupportingRegistrationApplicationStrategy.java",
    "line": 126,
    "code": "        coreHandler.sendNotifications(application, action);\n    }\n\n    /** Billed per product, like GDHT-PBN-L and DR08. */\n    @Override\n    public List<ApplicationRequestServiceDto> getApplicationRequestServices(Application application) throws BaseException {\n        int productCount = productRepository.findByApplicationIdOrderByIdAsc(application.getId()).size();\n        return List.of(ApplicationRequestServiceDto.builder()\n                .serviceCode(ServiceCode.HEALTH_SUPPORTING_PRODUCT_LICENSE_REGISTRATION)\n                .quantity(Math.max(productCount, 1))\n                .build());\n    }\n\n    @Override\n    public BaseApplicationResponseDto mapToResponseDto(Application application) {\n        HealthSupportingRegistrationApplicationResponseDto dto = applicationMapper\n                .toHealthSupportingRegistrationApplicationResponseDto(application);\n        detailRepository.findById(application.getId()).ifPresent(detail -> {\n            HealthSupportingResponseDto hs = detailMapper.toDetailResponseDto(detail);\n            hs.setProducts(productRepository.findByApplicationIdOrderByIdAsc(application.getId()).stream()\n                    .map(detailMapper::toResponseDto)\n                    .toList());\n            dto.setHealthSupportingProduct(hs);\n        });\n        return dto;\n    }\n\n    @Override\n    public BaseSlimApplicationResponseDto mapToSlimResponseDto(Application application) {\n        return applicationMapper.toSlimHealthSupportingRegistrationApplicationResponseDto(application);\n    }\n\n    @Override\n    public Map<String, Object> buildApprovedFormData(Application application) {\n        Map<String, Object> data = formDataHelper.buildCommonFormData(application);\n        formDataHelper.enrichWithAttachments(data, application);\n        detailRepository.findById(application.getId()).ifPresent(detail -> data.put(\"health_supporting_product\",\n                buildHealthSupportingFormData(detail,\n                        productRepository.findByApplicationIdOrderByIdAsc(application.getId()))));\n        return data;\n    }\n\n    @Override\n    public ApplicationApprovedMessage toApplicationApprovedMessage(Application application, String formData) {\n        return applicationApprovedMapper\n                .toApplicationApprovedMessageByHealthSupportingProductRegistration(application, formData);\n    }\n\n    @Override\n    public Map<String, Object> buildCertificateData(Application application) {\n        return certificateDataBuilder.build(application);\n    }\n\n    /** One certificate_data map per product: each product gets its own certificate. */\n    @Override"
  },
  "hsReplace": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/health_supporting_product/strategy/HealthSupportingRegistrationApplicationStrategy.java",
    "line": 200,
    "code": "        if (products == null) return;\n        productRepository.deleteByApplicationId(application.getId());\n        for (HealthSupportingProductRequestDto productDto : products) {\n            if (productDto == null) continue;\n            // Same lookup as the application's own attachments: an unknown file id is rejected, and name,\n            // path, size and content type are copied from the uploaded file.\n            productDto.setAttachments(attachmentResolutionService.resolve(productDto.getAttachments()));\n            ApplicationHealthSupportingProductDetail product = detailMapper.toEntity(productDto);\n            product.setApplication(application);\n            productRepository.save(product);\n        }\n    }\n\n    private BiConsumer<BaseApplicationRequestDto, Map<String, Object>> buildValidationProcessor(Long applicationId) {\n        return (requestDto, fieldErrors) -> {\n            ApplicationHealthSupportingDetail detail = detailRepository.findById(applicationId).orElse(null);\n            if (detail == null) {\n                fieldErrors.put(ROOT, \"not.null\");\n                return;\n            }\n            // The establishment must be active, the applicant's own, and hold an active TR01 / TR07 licence.\n            formDataHelper.validatePharmaceuticalPrerequisiteLicense(\n                    detail.getPrerequisiteProfileId(), fieldErrors, ROOT + \".prerequisiteProfileId\");\n"
  },
  "hsValidate": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/health_supporting_product/strategy/HealthSupportingRegistrationApplicationStrategy.java",
    "line": 221,
    "code": "            formDataHelper.validatePharmaceuticalPrerequisiteLicense(\n                    detail.getPrerequisiteProfileId(), fieldErrors, ROOT + \".prerequisiteProfileId\");\n\n            List<ApplicationHealthSupportingProductDetail> products =\n                    productRepository.findByApplicationIdOrderByIdAsc(applicationId);\n            if (products.isEmpty()) {\n                fieldErrors.put(PRODUCTS, \"not.null\");\n                return;\n            }\n            for (int i = 0; i < products.size(); i++) {\n                collectViolations(detailMapper.toRequestDto(products.get(i)), PRODUCTS + \"[\" + i + \"]\", fieldErrors);\n                validateProductAttachments(products.get(i), PRODUCTS + \"[\" + i + \"].attachments\", fieldErrors);\n            }\n            // The core service-document check reads the application's attachments only. Add every product's\n            // files so it does not report the product documents missing at the root (as DR07 and DR08 do).\n            mergeProductAttachments(requestDto, products);\n        };\n    }\n\n    /** Each product must carry every required product document itself; another product's file does not count. */\n    private void validateProductAttachments(ApplicationHealthSupportingProductDetail product, String errorKey,\n                                            Map<String, Object> fieldErrors) {\n        List<AttachmentDto> attachments = product.getAttachments() != null\n                ? attachmentMapper.toAttachmentDtos(product.getAttachments())\n                : List.of();\n        List<MissingAttachmentItemResponseDto> missing;\n        try {\n            missing = serviceDocumentGroupService\n                    .validateAttachmentsByServiceCode(ServiceCode.HEALTH_SUPPORTING_PRODUCT_LICENSE_REGISTRATION, attachments)\n                    .getMissingAttachments().stream()\n                    .filter(item -> PRODUCT_DOCUMENT_KEYS.contains(item.getKey()))\n                    .toList();\n        } catch (BaseException ex) {\n            fieldErrors.putIfAbsent(errorKey, ex.getMessage());\n            return;\n        }\n        if (!missing.isEmpty()) {\n            MissingAttachmentResponseDto response = new MissingAttachmentResponseDto();\n            response.setMessage(MISSING_ATTACHMENTS);\n            response.setItems(missing);\n            fieldErrors.putIfAbsent(errorKey, response);\n        }\n    }\n\n    private void mergeProductAttachments(BaseApplicationRequestDto requestDto,\n                                         List<ApplicationHealthSupportingProductDetail> products) {\n        List<AttachmentDto> combined = new ArrayList<>(\n                requestDto.getAttachments() != null ? requestDto.getAttachments() : List.of());\n        products.stream()\n                .map(ApplicationHealthSupportingProductDetail::getAttachments)\n                .filter(Objects::nonNull)\n                .flatMap(List::stream)\n                .map(attachmentMapper::toAttachmentDto)\n                .forEach(combined::add);\n        requestDto.setAttachments(combined);\n    }\n\n    private void collectViolations(Object target, String pathPrefix, Map<String, Object> fieldErrors) {\n        Set<ConstraintViolation<Object>> violations = validator.validate(target, Default.class, SubmitValidation.class);\n        for (ConstraintViolation<Object> violation : violations) {\n            fieldErrors.putIfAbsent(pathPrefix + \".\" + violation.getPropertyPath(), violation.getMessage());"
  },
  "hsPayload": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/health_supporting_product/strategy/HealthSupportingRegistrationApplicationStrategy.java",
    "line": 283,
    "code": "    }\n\n    private Map<String, Object> buildHealthSupportingFormData(ApplicationHealthSupportingDetail detail,\n                                                              List<ApplicationHealthSupportingProductDetail> products) {\n        Map<String, Object> m = new HashMap<>();\n        m.put(\"prerequisite_profile_id\", detail.getPrerequisiteProfileId());\n        // One entry per product: MOH-Profile issues one licence (and one certificate) for each.\n        m.put(\"products\", products.stream().map(this::buildProductFormData).toList());\n        return m;\n    }\n\n    private Map<String, Object> buildProductFormData(ApplicationHealthSupportingProductDetail d) {\n        Map<String, Object> m = new HashMap<>();\n        m.put(\"application_type\", d.getApplicationType() != null ? d.getApplicationType().name() : null);\n        m.put(\"product_name\", d.getProductName());\n        m.put(\"composition_and_strength\", d.getCompositionAndStrength());\n        m.put(\"dosage_form\", d.getDosageForm());\n        m.put(\"pack_size\", d.getPackSize());\n        m.put(\"manufacturer_name\", d.getManufacturerName());\n        m.put(\"manufacturer_address\", d.getManufacturerAddress());\n        m.put(\"manufacturer_country\", d.getManufacturerCountry());\n        m.put(\"mah_name\", d.getMahName());\n        m.put(\"mah_address\", d.getMahAddress());\n        m.put(\"mah_country\", d.getMahCountry());\n        m.put(\"shelf_life_months\", d.getShelfLifeMonths());\n        m.put(\"intended_use\", d.getIntendedUse());\n        m.put(\"attachments\", d.getAttachments());\n        return m;\n    }\n}\n"
  },
  "hsHandler": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/healthsupporting/strategy/handler/HealthSupportingRegisterHandler.java",
    "line": 44,
    "code": "    public void handle(HealthSupportingRegisterRequestDto requestDto) throws NotFoundException {\n        registerHandler.handle(requestDto, this);\n    }\n\n    @Override\n    public HealthSupportingDetailsContext initDetails(HealthSupportingRegisterRequestDto requestDto) {\n        return new HealthSupportingDetailsContext();\n    }\n\n    @Override\n    public void processLicenses(LicenseRegistrationContext<HealthSupportingDetailsContext> ctx,\n                                HealthSupportingRegisterRequestDto requestDto) throws NotFoundException {\n        List<HealthSupportingProductDto> products = resolveProducts(requestDto);\n        if (products.isEmpty()) {\n            throw new NotFoundException(\"DR09 approved message carries no health_supporting_product\");\n        }\n        Profile profile = ctx.getProfile();\n\n        // One licence (and so one certificate) per product, like GDHT-PBN-L.\n        for (HealthSupportingProductDto product : products) {\n            // The licence number's origin digit is read from the request's current product.\n            requestDto.setHealthSupportingProduct(product);\n\n            RegulatoryRegistration registration = licenseBuilder.buildNew(\n                    LicenseBuildContext.<HealthSupportingRegisterRequestDto, HealthSupportingCertificateType>builder()\n                            .profile(profile)\n                            .item(HealthSupportingCertificateType.HEALTH_SUPPORTING_PRODUCT_LICENSE)\n                            .operationType(LicenseOperationType.ISSUE)\n                            .requestDto(requestDto)\n                            .build());\n            regulatoryRegistrationService.save(registration);\n            profile.addRegistration(registration);\n\n            HealthSupportingProductLicenseDetail detail = mapper.toDetail(product);\n            detail.setProfile(profile);\n            detail.setRegistration(registration);\n            detail = detailRepository.save(detail);\n            if (ctx.getDetails().getDetail() == null) {\n                ctx.getDetails().setDetail(detail);\n            }\n            log.info(\"[GDHT-HS-L] Issued licence {} for profile {}\",\n                    registration.getLicense().getLicenseNo(), profile.getNo());\n        }\n    }\n\n    private List<HealthSupportingProductDto> resolveProducts(HealthSupportingRegisterRequestDto requestDto) {\n        List<HealthSupportingProductDto> products = requestDto.getHealthSupportingProducts();\n        if (products != null && !products.isEmpty()) {\n            return products;\n        }\n        return requestDto.getHealthSupportingProduct() != null\n                ? List.of(requestDto.getHealthSupportingProduct())\n                : List.of();\n    }\n\n    @Override\n    public void publishEvents(LicenseRegistrationContext<HealthSupportingDetailsContext> ctx,\n                              HealthSupportingRegisterRequestDto requestDto) {\n        Profile profile = ctx.getProfile();\n        applicationEventPublisher.publishEvent(\n                new ProfileCreatedDomainEvent(ctx.getApplicationId(), ctx.getApplicationNo(), profile));\n\n        List<RegulatoryRegistration> registrations = ctx.getChangedRegistrations();\n        if (registrations == null || registrations.isEmpty()) {\n            return;\n        }\n        List<License> licenses = registrations.stream().map(RegulatoryRegistration::getLicense).toList();\n        certificatePublishStrategy.publishCertificateOperationEvent(\n                LicenseOperationType.ISSUE, profile, requestDto.getServiceCode(), licenses);\n    }\n}"
  },
  "hsMapper": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/healthsupporting/mapper/HealthSupportingMapper.java",
    "line": 55,
    "code": "    // ---------------------------------------------------------------- approved message -> request\n    public HealthSupportingRegisterRequestDto toRegisterRequestDto(ApplicationApprovedMessage message) {\n        HealthSupportingFormData formData = parseFormData(message.getFormData());\n        HealthSupportingRegisterRequestDto dto = new HealthSupportingRegisterRequestDto();\n        applyBaseFields(dto, message);\n        dto.setUserId(message.getUserId());\n        dto.setDepartmentId(message.getDepartmentId());\n        dto.setApprovedDate(message.getApprovedDate());\n        if (formData != null) {\n            dto.setProfileId(formData.getProfileId());\n            HealthSupportingDto healthSupporting = formData.getHealthSupportingProduct();\n            List<HealthSupportingProductDto> products = healthSupporting == null || healthSupporting.getProducts() == null\n                    ? List.of()\n                    : healthSupporting.getProducts().stream().filter(Objects::nonNull).toList();\n            if (!products.isEmpty()) {\n                // The establishment profile is one per application; each product licence keeps a copy.\n                products.forEach(p -> p.setPrerequisiteProfileId(healthSupporting.getPrerequisiteProfileId()));\n                // The application is named after its first product.\n                dto.setApplicationNameEn(products.get(0).getProductName());\n                dto.setHealthSupportingProducts(products);\n                dto.setHealthSupportingProduct(products.get(0));\n            }\n            dto.setCompany(formData.getCompany());\n            dto.setApplicant(formData.getApplicant());\n            dto.setLicensee(formData.getLicensee());\n            dto.setLicenseeType(formData.getLicenseeType());\n            if (formData.getAttachments() != null) {\n                dto.setAttachments(formData.getAttachments());\n            }\n        }\n        return dto;\n    }\n\n    // ---------------------------------------------------------------- dto <-> entity (by hand)\n    public HealthSupportingProductLicenseDetail toDetail(HealthSupportingProductDto dto) {\n        HealthSupportingProductLicenseDetail e = new HealthSupportingProductLicenseDetail();\n        e.setPrerequisiteProfileId(dto.getPrerequisiteProfileId());\n        e.setApplicationType(dto.getApplicationType());\n        e.setProductName(dto.getProductName());\n        e.setCompositionAndStrength(dto.getCompositionAndStrength());\n        e.setDosageForm(dto.getDosageForm());\n        e.setPackSize(dto.getPackSize());\n        e.setManufacturerName(dto.getManufacturerName());\n        e.setManufacturerAddress(dto.getManufacturerAddress());\n        e.setManufacturerCountry(dto.getManufacturerCountry());\n        e.setMahName(dto.getMahName());\n        e.setMahAddress(dto.getMahAddress());\n        e.setMahCountry(dto.getMahCountry());\n        e.setShelfLifeMonths(dto.getShelfLifeMonths());\n        e.setIntendedUse(dto.getIntendedUse());\n        e.setAttachments(dto.getAttachments() != null ? attachmentMapper.fromAttachmentDtos(dto.getAttachments()) : null);\n        return e;\n    }\n\n    public HealthSupportingProductDto toProductDto(HealthSupportingProductLicenseDetail e) {\n        if (e == null) {\n            return null;\n        }"
  },
  "hsEntity": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/healthsupporting/model/HealthSupportingProductLicenseDetail.java",
    "line": 35,
    "code": "@Builder\n@Entity\n@Table(name = \"health_supporting_product_license_details\")\npublic class HealthSupportingProductLicenseDetail extends BaseAuditable<String> {\n\n    @Id\n    @Column(name = \"registration_id\")\n    private Long id;\n\n    @JsonIgnore\n    @MapsId\n    @OneToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = \"registration_id\")\n    private RegulatoryRegistration registration;\n\n    @ManyToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = \"profile_id\", referencedColumnName = \"id\")\n    private Profile profile;\n\n    /** TR01 / TR07 establishment profile the applicant registered this product under (validated by Application). */\n    @Column(name = \"prerequisite_profile_id\")\n    private Long prerequisiteProfileId;\n\n    @Enumerated(EnumType.STRING)\n    private HealthSupportingApplicationType applicationType;\n\n    private String productName;\n\n    @Column(length = 2000)\n    private String compositionAndStrength;\n\n    private String dosageForm;\n    private String packSize;\n    private String manufacturerName;\n\n    @Column(length = 1000)\n    private String manufacturerAddress;\n\n    private String manufacturerCountry;\n    private String mahName;\n\n    @Column(length = 1000)\n    private String mahAddress;\n\n    private String mahCountry;\n    private Integer shelfLifeMonths;\n\n    @Column(length = 1000)\n    private String intendedUse;\n\n    /** This product's own documents from the approved application; shared documents stay on the profile. */\n    @Type(JsonType.class)\n    @JdbcTypeCode(SqlTypes.JSON)\n    @Column(name = \"attachments\", columnDefinition = \"jsonb\")\n    private List<Attachment> attachments;\n}"
  },
  "hsOrigin": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/healthsupporting/dto/operation/HealthSupportingRegisterRequestDto.java",
    "line": 20,
    "code": "\n    /** Every product of the application; one licence is issued per entry, like GDHT-PBN-L. */\n    private List<HealthSupportingProductDto> healthSupportingProducts;\n\n    /**\n     * The product currently being licensed. The register handler points this at each entry of\n     * {@link #healthSupportingProducts} in turn, so {@link #productOrigin()} follows that product.\n     */\n    private HealthSupportingProductDto healthSupportingProduct;\n\n    /** Decision D3: the form's Application Type (LOCAL / IMPORT) decides the number's origin digit. */\n    @Override\n    public ProductOrigin productOrigin() {\n        if (healthSupportingProduct == null || healthSupportingProduct.getApplicationType() == null) {\n            return null;\n        }\n        return switch (healthSupportingProduct.getApplicationType()) {\n            case LOCAL -> ProductOrigin.LOCAL;\n            case IMPORT -> ProductOrigin.IMPORT;\n        };\n    }\n}"
  },
  "hsIssue": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/healthsupporting/strategy/HealthSupportingCertificatePublishStrategy.java",
    "line": 46,
    "code": "    public List<CertificateRequestDto> buildCertificateRequests(LicenseOperationType operationType, Profile profile,\n                                                                String serviceCode, List<License> licenses) {\n        Map<Long, HealthSupportingProductLicenseDetail> byLicenseId = detailRepository\n                .findAllByLicenseIdIn(licenses.stream().map(License::getId).toList())\n                .stream()\n                .collect(Collectors.toMap(d -> d.getRegistration().getLicense().getId(), Function.identity()));\n        List<HealthSupportingProductLicenseDetail> details = licenses.stream()\n                .map(l -> byLicenseId.get(l.getId()))\n                .collect(Collectors.toCollection(java.util.ArrayList::new));\n        return mapper.toCertificateRequests(profile, licenses, details, operationType);\n    }\n}"
  },
  "tmRenewCodes": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/constant/ServiceCode.java",
    "line": 466,
    "code": "     *     TRADITIONAL_MEDICINE_PRODUCT (DR08)\n     * =============================================================\n     * Product-level registration of a traditional medicine product.\n     * <pre>\n     * GDHT-TM-L    Registration\n     * GDHT-TM-R    Renewal (DR08.01)\n     * GDHT-TM-U    Update container (DR08.03 to DR08.07)\n     *  - GDHT-TM-UPN  Product name change (DR08.03)\n     *  - GDHT-TM-UP   Packaging change (DR08.04)\n     *  - GDHT-TM-UM   MAH change (DR08.05)\n     *  - GDHT-TM-UMF  Manufacturer change (DR08.06)\n     *  - GDHT-TM-UDF  Dosage form or appearance change (DR08.07)\n     * GDHT-TM-T    Cancellation (DR08.08)\n     * </pre>\n     */\n    public static final String TRADITIONAL_MEDICINE_LICENSE_REGISTRATION = \"GDHT-TM-L\";\n    public static final String TRADITIONAL_MEDICINE_LICENSE_RENEWAL = \"GDHT-TM-R\";\n    public static final String TRADITIONAL_MEDICINE_LICENSE_UPDATE = \"GDHT-TM-U\";\n    public static final String TRADITIONAL_MEDICINE_LICENSE_UPDATE_PRODUCT_NAME = \"GDHT-TM-UPN\";\n    public static final String TRADITIONAL_MEDICINE_LICENSE_UPDATE_PACKAGING = \"GDHT-TM-UP\";\n    public static final String TRADITIONAL_MEDICINE_LICENSE_UPDATE_MAH = \"GDHT-TM-UM\";\n    public static final String TRADITIONAL_MEDICINE_LICENSE_UPDATE_MANUFACTURER = \"GDHT-TM-UMF\";\n    public static final String TRADITIONAL_MEDICINE_LICENSE_UPDATE_DOSAGE_FORM = \"GDHT-TM-UDF\";\n    public static final String TRADITIONAL_MEDICINE_LICENSE_TERMINATION = \"GDHT-TM-T\";"
  },
  "tmProfileCodes": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/constant/ServiceCode.java",
    "line": 349,
    "code": "     * =============================================================\n     *     TRADITIONAL_MEDICINE_PRODUCT (DR08)\n     * =============================================================\n     * Product-level traditional medicine registration. Update section codes\n     * are reserved; Profile routes future updates through GDHT-TM-U.\n     * <pre>\n     * GDHT-TM-L    Registration\n     * </pre>\n     */\n    public static final String TRADITIONAL_MEDICINE_LICENSE_REGISTRATION = \"GDHT-TM-L\";"
  },
  "tmRenewAppShared": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/handler/ApplicationRenewHandler.java",
    "line": 14,
    "code": "@RequiredArgsConstructor\npublic class ApplicationRenewHandler {\n\n    private final ApplicationCoreHandler coreHandler;\n\n    public <TRequestDto extends BaseRenewalApplicationRequestDto> Application saveApplication(\n            Long applicationId,\n            TRequestDto requestDto,\n            Application existingApplication,\n            SpecificFieldProcessor<TRequestDto, Application> specificFieldProcessor\n    ) throws BaseException {\n\n        return coreHandler.saveApplication(applicationId, requestDto, existingApplication, (req, app) -> {\n\n            app.setProfileId(req.getProfileId());\n\n            // Execute the specific logic from strategy\n            if (specificFieldProcessor != null) {\n                specificFieldProcessor.process(req, app);\n            }\n        });\n    }\n\n    public Application submitApplication(Long applicationId, BiConsumer<BaseApplicationRequestDto, Map<String, Object>> specificValidationProcessor) throws BaseException {\n        return coreHandler.submitApplication(applicationId, specificValidationProcessor);\n    }\n\n    public void validateSubmitApplication(Application application, BiConsumer<BaseApplicationRequestDto, Map<String, Object>> specificValidationProcessor) throws BaseException {\n        coreHandler.validateSubmitApplication(application, specificValidationProcessor);\n    }\n}\n"
  },
  "tmRenewShared": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/handler/BaseRenewHandler.java",
    "line": 27,
    "code": "    @Transactional\n    public <T extends RenewRequestDto> void handle(T requestDto, RenewHandlerHooks<T> hooks) throws NotFoundException {\n        Profile profile = profileRepository.findWithDetailsById(requestDto.getProfileId())\n                .orElseThrow(() -> new NotFoundException(\"Profile not found: \" + requestDto.getProfileId()));\n\n        validateRenewal(profile, requestDto);\n        hooks.applyRenewal(profile, requestDto);\n        profileRepository.saveAndFlush(profile);\n        regulatoryRegistrationService.syncAll(profile.getRegistrations());\n        hooks.publishEvents(profile, requestDto);\n    }\n\n    private <T extends RenewRequestDto> void validateRenewal(Profile profile, T requestDto) {\n        boolean hasRenewable = Optional.ofNullable(profile.getRegistrations())\n                .orElseGet(Collections::emptyList)\n                .stream()\n                .filter(r -> requestDto.getServiceCode() == null\n                        || requestDto.getServiceCode().equals(r.getServiceCode()))\n                .map(RegulatoryRegistration::getLicense)\n                .anyMatch(l -> l != null && l.isRenewable());\n        if (!hasRenewable) {\n            throw new ValidationException(\"No renewable licenses found for profile: \" + profile.getNo());\n        }\n    }\n}"
  },
  "tmRenewAppFactory": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/application/strategy/application/ApplicationStrategyFactory.java",
    "line": 30,
    "code": "\n    @SuppressWarnings(\"unchecked\")\n    public <T extends BaseApplicationRequestDto> ApplicationStrategy<T> getStrategy(String serviceCode) throws BaseException {\n        ApplicationStrategy<?> strategy = this.strategies.get(serviceCode);\n        if (strategy == null) {\n            throw new BaseException(\"Unsupported service type!\", HttpStatus.UNPROCESSABLE_ENTITY.value());\n        }\n        return (ApplicationStrategy<T>) strategy;\n    }"
  },
  "tmRenewProfileFactory": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/LicenseStrategyFactory.java",
    "line": 60,
    "code": "    }\n\n    public BaseProfileResponseDto getProfileDetails(Profile profile) throws BaseException {\n        return getStrategy(profile.getService().getCode()).getProfileDetails(profile);\n    }\n\n    /**\n     * {@code { profile, license, detail }} for one license. The strategy is resolved by the"
  },
  "tmChangeShared": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/handler/BaseUpdateHandler.java",
    "line": 29,
    "code": "        Profile profile = resolveLicense(requestDto);\n        validateUpdate(profile, requestDto);\n        applyUpdate(profile, requestDto);\n        profileRepository.saveAndFlush(profile);\n        publishEvents(profile, requestDto);\n    }\n\n    protected Profile resolveLicense(T requestDto) throws NotFoundException {\n        return profileRepository.findWithDetailsById(requestDto.getProfileId())\n                .orElseThrow(() -> new NotFoundException(\"Profile not found: \" + requestDto.getProfileId()));\n    }\n\n    protected void validateUpdate(Profile profile, T requestDto) {\n        if (profile.getStatus() == ProfileStatus.ACTIVE) {\n            throw new ValidationException(\"Profile is not active: \" + profile.getNo());\n        }\n    }\n\n    protected abstract void applyUpdate(Profile profile, T requestDto);\n\n    protected abstract void publishEvents(Profile profile, T requestDto);\n}\n"
  },
  "hsSubCodes": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/constant/ServiceCode.java",
    "line": 414,
    "code": "     * =============================================================\n     *     HEALTH_SUPPORTING_PRODUCT (DR09)\n     *  =============================================================\n     *  Product-level registration of a health supporting product.\n     *  <pre>\n     *  GDHT-HS-L    Registration (DR09)\n     *  GDHT-HS-R    Renewal (DR09.01)\n     *  GDHT-HS-U    Update container (DR09.03 - DR09.06)\n     *   - GDHT-HS-UPN  Product name change\n     *   - GDHT-HS-UP  Packaging change\n     *   - GDHT-HS-UM  MAH name and/or address change\n     *   - GDHT-HS-UMF  Manufacturer name and/or address change\n     *  GDHT-HS-T    Cancellation (DR09.07)\n     *  </pre>\n     */\n    public static final String HEALTH_SUPPORTING_PRODUCT_LICENSE_REGISTRATION = \"GDHT-HS-L\";\n    public static final String HEALTH_SUPPORTING_PRODUCT_LICENSE_RENEWAL = \"GDHT-HS-R\";\n    public static final String HEALTH_SUPPORTING_PRODUCT_LICENSE_UPDATE = \"GDHT-HS-U\";\n    public static final String HEALTH_SUPPORTING_PRODUCT_LICENSE_UPDATE_PRODUCT_NAME = \"GDHT-HS-UPN\";\n    public static final String HEALTH_SUPPORTING_PRODUCT_LICENSE_UPDATE_PACKAGING = \"GDHT-HS-UP\";\n    public static final String HEALTH_SUPPORTING_PRODUCT_LICENSE_UPDATE_MAH = \"GDHT-HS-UM\";\n    public static final String HEALTH_SUPPORTING_PRODUCT_LICENSE_UPDATE_MANUFACTURER = \"GDHT-HS-UMF\";\n    public static final String HEALTH_SUPPORTING_PRODUCT_LICENSE_TERMINATION = \"GDHT-HS-T\";"
  },
  "hsSubProfileCodes": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/constant/ServiceCode.java",
    "line": 293,
    "code": "     *  =============================================================\n     *     HEALTH_SUPPORTING_PRODUCT (DR09)\n     *  =============================================================\n     *  Product-level registration of a health supporting product.\n     *  <pre>\n     *  GDHT-HS-L    Registration\n     *  GDHT-HS-R    Renewal\n     *  GDHT-HS-U    Update container (sections U03..U06)\n     *  GDHT-HS-T    Cancellation\n     *  </pre>\n     */\n    public static final String HEALTH_SUPPORTING_PRODUCT_LICENSE_REGISTRATION = \"GDHT-HS-L\";\n    public static final String HEALTH_SUPPORTING_PRODUCT_LICENSE_RENEWAL      = \"GDHT-HS-R\";\n    public static final String HEALTH_SUPPORTING_PRODUCT_LICENSE_UPDATE       = \"GDHT-HS-U\";\n    public static final String HEALTH_SUPPORTING_PRODUCT_LICENSE_TERMINATION  = \"GDHT-HS-T\";"
  },
  "currentTerminate": {
    "repo": "MOH-Profile",
    "rev": "a9caf9a",
    "path": "src/main/java/kh/gov/esb/profile/modules/core/license/strategy/handler/BaseTerminateHandler.java",
    "line": 30,
    "code": "    @Transactional\n    public <T extends TerminateRequestDto> void handle(T requestDto, TerminateHandlerHooks<T> hooks) throws NotFoundException {\n        Profile profile = profileRepository.findWithDetailsById(requestDto.getProfileId())\n                .orElseThrow(() -> new NotFoundException(\"Profile not found: \" + requestDto.getProfileId()));\n\n        if (profile.getStatus() == ProfileStatus.TERMINATED) {\n            throw new ValidationException(\"Profile is already terminated: \" + profile.getNo());\n        }\n\n        profile.setStatus(ProfileStatus.TERMINATED);\n        Optional.ofNullable(profile.getRegistrations())\n                .orElseGet(Collections::emptyList)\n                .stream()\n                .map(RegulatoryRegistration::getLicense)\n                .filter(Objects::nonNull)\n                .filter(l -> l.getStatus().isOpen())\n                .forEach(l -> l.setStatus(LicenseStatus.TERMINATED));\n\n        profileRepository.saveAndFlush(profile);\n        regulatoryRegistrationService.syncAll(profile.getRegistrations());\n        hooks.publishEvents(profile, requestDto);\n    }\n}\n"
  },
  "tmProductMap": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/traditional_medicine/mapper/ApplicationTraditionalMedicineDetailMapper.java",
    "line": 16,
    "code": "\n    // ── Per-application data ────────────────────────────────────────────\n    @Mapping(target = \"applicationId\", ignore = true)\n    @Mapping(target = \"application\", ignore = true)\n    ApplicationTraditionalMedicineDetail toDetail(TraditionalMedicineRequestDto dto);\n\n    @Mapping(target = \"applicationId\", ignore = true)\n    @Mapping(target = \"application\", ignore = true)\n    void updateDetail(TraditionalMedicineRequestDto dto, @MappingTarget ApplicationTraditionalMedicineDetail entity);\n\n    /** Products are attached by the caller from their own table. */\n    @Mapping(target = \"products\", ignore = true)\n    TraditionalMedicineRequestDto toRequestDto(ApplicationTraditionalMedicineDetail entity);\n\n    @Mapping(target = \"products\", ignore = true)\n    TraditionalMedicineResponseDto toResponseDto(ApplicationTraditionalMedicineDetail entity);\n\n    // ── Products ────────────────────────────────────────────────────────\n    @Mapping(target = \"id\", ignore = true)\n    @Mapping(target = \"application\", ignore = true)\n    ApplicationTraditionalMedicineProduct toProduct(TraditionalMedicineProductRequestDto dto);\n\n    TraditionalMedicineProductRequestDto toProductRequestDto(ApplicationTraditionalMedicineProduct entity);\n\n    TraditionalMedicineProductResponseDto toProductResponseDto(ApplicationTraditionalMedicineProduct entity);\n}\n"
  },
  "hsProductMap": {
    "repo": "MOH-Application",
    "rev": "f89d2061",
    "path": "src/main/java/kh/gov/esb/application/modules/health_supporting_product/mapper/ApplicationHealthSupportingProductDetailMapper.java",
    "line": 16,
    "code": "\n    // ── Per-application data ────────────────────────────────────────────\n    @Mapping(target = \"applicationId\", ignore = true)\n    @Mapping(target = \"application\", ignore = true)\n    ApplicationHealthSupportingDetail toDetail(HealthSupportingRequestDto dto);\n\n    @Mapping(target = \"applicationId\", ignore = true)\n    @Mapping(target = \"application\", ignore = true)\n    void updateDetail(HealthSupportingRequestDto dto, @MappingTarget ApplicationHealthSupportingDetail entity);\n\n    /** Products are attached by the caller from their own table. */\n    @Mapping(target = \"products\", ignore = true)\n    HealthSupportingRequestDto toDetailRequestDto(ApplicationHealthSupportingDetail entity);\n\n    @Mapping(target = \"products\", ignore = true)\n    HealthSupportingResponseDto toDetailResponseDto(ApplicationHealthSupportingDetail entity);\n\n    // ── Products ────────────────────────────────────────────────────────\n    @Mapping(target = \"id\", ignore = true)\n    @Mapping(target = \"application\", ignore = true)\n    ApplicationHealthSupportingProductDetail toEntity(HealthSupportingProductRequestDto dto);\n\n    HealthSupportingProductRequestDto toRequestDto(ApplicationHealthSupportingProductDetail entity);\n\n    HealthSupportingProductResponseDto toResponseDto(ApplicationHealthSupportingProductDetail entity);\n}\n"
  }
};
