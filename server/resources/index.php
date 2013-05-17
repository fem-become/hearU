<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" id="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="hearU">
<link rel="stylesheet" type="text/css" href="css/stroll.css">
<link rel="stylesheet" type="text/css" href="css/app.css">
<title>我的歌单</title>
<script type="text/tpl">
curl flip fly-simplified tilt zipper
</script>
</head>
<body >
<div id="page">
	<div id="sidebar" class="slider side-bar"></div>
	<div id="header">
		<div class="main-title slider">我的歌单</div>
	</div>
	<div id="wrapper">
		<div id="scroller">
			<div class="pull-more pull-down" id="pulldown" style="display:none;">
				<div class="pull-more-wrapper">
					<span class="pull-more-icon"></span>
					<span class="pull-more-label">下拉创建新歌单</span>
				</div>
			</div>
			<ul id="mainlist" class="fly-simplified">
				<?php //;//
				$items=array('强力劲爆DJ舞曲','网络歌曲情缘','中国风，中国情','刘德华20年经典重现','净化心灵的西藏轻音乐','分手需要练习的','歌声带你走过绿意','我在旧时光中回忆你','黄霑配乐黄飞鸿系列电影原声','谢谢这些歌郁闷时陪着我','听起来你很开心','在身心疲惫时，把自己融入歌声','都曾反复播放的歌','安静时光，静听一首国语歌','如果你看见，这些歌给你听','每个人的内心都是孤独','伤感永远只留给自己','期待着的温暖歌声','好听的电子氛围音乐','不同感觉的爵士说唱','让人放松的爵士乐','不朽的金属之声','流行舞曲金曲选','超酷牛仔乡村音乐精选','鲍勃迪伦民谣歌曲选','神秘的非洲音乐辑','古典音乐大合唱','好听人气RNB女声歌曲','好听手风琴乐曲选');
					foreach ($items as $key=>$item) {
						?>
						<li class="<?php if($key<8){echo "";}?>song-list item" data-index=<?php echo $key+1;?>>
							<div class="slider">
								<?php echo $item;?>
							</div>
							<img class="check" src="images/check.png">
							<img class="cross" src="images/cross.png">
						</li>
						<?php
					}
				?>
			</ul>
		</div>
	</div>
</div>
<div class="edit-wrapper">
	<div id="edit">
		<input type="text" placeholder="请输入歌单名称">
	</div>
</div>
<script type="text/javascript1" src="http://192.168.1.104:8080/target/target-script-min.js#anonymous"></script>
<script src="js/zepto.min.js"></script>
<script src="js/throttle.js"></script>
<script src="js/iscroll.js"></script>
<script src="js/hammer.js"></script>
<script src="js/app.js"></script>
<script src="js/config.js"></script>
<script src="js/header.js"></script>
<script>
$(function(){
	HearU.init();
});
</script>
</body>
</html>
