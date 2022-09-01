PHONY: build help update promote-staging

IMAGE=terria-mapexplorer-v8
# building it ourselves
SRC_TAG=latest

help:
	@echo ""
	@echo "Commands:"
	@echo ""
	@echo "  build: builds and tags the image"
	@echo "  push: tags and pushes the image as staging"
	@echo "  revert-staging: reverts the staging image to the previous version"
	@echo "  promote-staging: tags and pushes the image as production"
	@echo ""

build:
	docker build -t $(IMAGE) .

update:
	git submodule update --init
	$(MAKE) build

save-staging-backup:
	docker pull repository.staging.derilinx.com/$(IMAGE):staging
	docker tag repository.staging.derilinx.com/$(IMAGE):staging repository.staging.derilinx.com/$(IMAGE):staging-prev
	docker push repository.staging.derilinx.com/$(IMAGE):staging-prev

push:
	-$(MAKE) save-staging-backup
	docker tag $(IMAGE):$(SRC_TAG) repository.staging.derilinx.com/$(IMAGE):staging
	docker push repository.staging.derilinx.com/$(IMAGE):staging

revert-staging:
	docker pull repository.staging.derilinx.com/$(IMAGE):staging-prev
	docker tag repository.staging.derilinx.com/$(IMAGE):staging-prev repository.staging.derilinx.com/$(IMAGE):staging
	docker push repository.staging.derilinx.com/$(IMAGE):staging

save-prod-backup:
	docker pull repository.staging.derilinx.com/$(IMAGE):prod
	docker tag repository.staging.derilinx.com/$(IMAGE):prod repository.staging.derilinx.com/$(IMAGE):prod-prev
	docker push repository.staging.derilinx.com/$(IMAGE):prod-prev

push-prod:
	-$(MAKE) save-prod-backup
	docker tag $(IMAGE):$(SRC_TAG) repository.staging.derilinx.com/$(IMAGE):prod
	docker push repository.staging.derilinx.com/$(IMAGE):prod