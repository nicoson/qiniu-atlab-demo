
Deploy:
	docker build -t atlab-demo .
	
	# push to avatest
	docker login reg.qiniu.com -u avatest@qiniu.com -p 25da897892c334ffd6187899a306c14959ae5c0d4552db8da0eb3cbb1e74299a
	docker tag atlab-demo reg.qiniu.com/avatest/atlab-demo:v1.3
	docker push reg.qiniu.com/avatest/atlab-demo:v1.3
