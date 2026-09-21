/**
 * Danh sách món ăn được chuyển đổi tự động từ data.json
 * Quy tắc link ảnh: `${dish.name}.webp` (lưu trong thư mục uploads)
 * Tổng số món ăn: 36
 */

export interface DishSeedItem {
  name: string
  price: number
  description: string
  image: string
}

export const dishesData: DishSeedItem[] = [
  {
    "name": "Phở Hà Nội",
    "price": 70000,
    "description": "Phở Hà Nội là món ăn \"quốc hồn quốc túy\", là niềm tự hào của ẩm thực Việt Nam. Nước dùng được ninh từ xương bò trong nhiều giờ, tạo nên vị ngọt thanh tự nhiên và hương thơm quyến rũ của các loại gia vị như hồi, quế, thảo quả.",
    "image": "Phở Hà Nội.webp"
  },
  {
    "name": "Bún Chả Hà Nội",
    "price": 75000,
    "description": "Bún chả là món ăn làm nên tên tuổi ẩm thực Hà Nội. Điểm nhấn của món ăn là những miếng chả thịt lợn băm và chả miếng nướng vàng ruộm trên than hoa, thơm lừng.",
    "image": "Bún Chả Hà Nội.webp"
  },
  {
    "name": "Bánh Đa Cua Hải Phòng",
    "price": 60000,
    "description": "Là đặc sản không thể bỏ qua khi đến Hải Phòng, bánh đa cua hấp dẫn bởi sợi bánh đa đỏ đặc trưng, dai và có mùi thơm riêng. Nước dùng được chế biến từ cua đồng, có vị ngọt thanh, đậm đà.",
    "image": "Bánh Đa Cua Hải Phòng.webp"
  },
  {
    "name": "Chả Mực Hạ Long",
    "price": 500000,
    "description": "Chả mực Hạ Long là niềm tự hào của ẩm thực Quảng Ninh, được làm hoàn toàn thủ công từ những con mực mai tươi ngon nhất. Mực được giã tay thay vì xay nhuyễn, giữ được độ dai giòn sần sật đặc trưng.",
    "image": "Chả Mực Hạ Long.webp"
  },
  {
    "name": "Phở Chua Lạng Sơn",
    "price": 50000,
    "description": "Phở chua Lạng Sơn mang một nét độc đáo riêng biệt so với các loại phở khác. Sợi phở dai, được trộn cùng thịt xá xíu, thịt vịt quay giòn bì, khoai lang chiên giòn, lạc rang thơm bùi và đặc biệt là nước sốt chua ngọt thanh mát.",
    "image": "Phở Chua Lạng Sơn.webp"
  },
  {
    "name": "Thắng Cố Lào Cai",
    "price": 150000,
    "description": "Thắng cố là món ăn truyền thống mang đậm bản sắc văn hóa của dân tộc H'Mông và các dân tộc vùng cao Tây Bắc. Món này được nấu từ lục phủ ngũ tạng của ngựa (hoặc trâu, bò), ninh nhừ trong nhiều giờ.",
    "image": "Thắng Cố Lào Cai.webp"
  },
  {
    "name": "Mèn Mén Hà Giang",
    "price": 30000,
    "description": "Mèn mén là món ăn truyền thống, gắn liền với cuộc sống của người Mông ở Hà Giang, thể hiện sự khéo léo và giản dị. Món này được làm từ hạt ngô tẻ xay nhỏ, sau đó hấp chín bằng chõ gỗ.",
    "image": "Mèn Mén Hà Giang.webp"
  },
  {
    "name": "Xôi Nếp Nương Điện Biên",
    "price": 40000,
    "description": "Xôi nếp nương Điện Biên nổi tiếng bởi sự dẻo thơm đặc biệt của hạt nếp được trồng trên các triền đồi. Hạt xôi căng tròn, bóng mượt và có mùi thơm tự nhiên của lúa mới.",
    "image": "Xôi Nếp Nương Điện Biên.webp"
  },
  {
    "name": "Vịt Quay 7 Vị Cao Bằng",
    "price": 400000,
    "description": "Vịt quay 7 vị là đặc sản độc đáo của Cao Bằng, hấp dẫn thực khách bởi hương vị đậm đà, khó quên. Những con vịt được chọn lọc kỹ càng, tẩm ướp với 7 loại gia vị bí truyền, sau đó quay trên than hồng cho đến khi lớp da vàng óng, giòn rụm.",
    "image": "Vịt Quay 7 Vị Cao Bằng.webp"
  },
  {
    "name": "Chè Tân Cương Thái Nguyên",
    "price": 800000,
    "description": "Được mệnh danh là \"Đệ nhất danh trà\" của Việt Nam, chè Tân Cương là niềm tự hào của Thái Nguyên. Loại chè này có cánh nhỏ, xoăn, xanh đen, khi pha cho nước màu vàng xanh trong trẻo.",
    "image": "Chè Tân Cương Thái Nguyên.webp"
  },
  {
    "name": "Nem Nắm Giao Thủy",
    "price": 80000,
    "description": "Nem nắm Giao Thủy là đặc sản trứ danh của Nam Định, mang hương vị không thể trộn lẫn. Món nem này được làm từ thịt lợn tươi thái mỏng, bì lợn luộc chín thái sợi, trộn đều với thính gạo rang thơm lừng và các loại gia vị bí truyền.",
    "image": "Nem Nắm Giao Thủy.webp"
  },
  {
    "name": "Cơm Cháy Ninh Bình",
    "price": 100000,
    "description": "Cơm cháy Ninh Bình là món ăn chinh phục thực khách bởi độ giòn rụm, thơm ngon khó cưỡng. Cơm được làm từ gạo nếp cái hoa vàng, nấu chín rồi ép thành từng miếng, sau đó chiên giòn vàng ươm.",
    "image": "Cơm Cháy Ninh Bình.webp"
  },
  {
    "name": "Mì Quảng Hội An",
    "price": 55000,
    "description": "Mì Quảng là một trong những món ăn trứ danh nhất miền Trung. Sợi mì to, dày và có màu vàng (hoặc trắng) đặc trưng, ăn kèm nước dùng ít nhưng đậm đà, được hầm từ xương, tôm, thịt lợn hoặc gà.",
    "image": "Mì Quảng Hội An.webp"
  },
  {
    "name": "Bún Bò Huế",
    "price": 65000,
    "description": "Bún Bò Huế, món bún \"quốc hồn quốc túy\" từ xứ Huế mộng mơ, làm say lòng thực khách bởi nước dùng đậm đà ninh từ xương bò. Mỗi tô bún là sự hòa quyện của chả cua, thịt bò bắp, giò heo, cùng vị cay nồng đặc trưng của sả và ớt.",
    "image": "Bún Bò Huế.webp"
  },
  {
    "name": "Bún Cá Nha Trang",
    "price": 55000,
    "description": "Món ăn đặc trưng của thành phố biển Nha Trang, hấp dẫn bởi nước dùng ngọt thanh được ninh từ xương cá biển, sợi bún dai ngon và những miếng chả cá dai, thơm được làm từ cá tươi nguyên chất.",
    "image": "Bún Cá Nha Trang.webp"
  },
  {
    "name": "Cao Lầu Hội An",
    "price": 50000,
    "description": "Cao Lầu, đặc sản riêng có của Hội An, làm say lòng thực khách bởi sợi mì vàng óng, dai đặc biệt - bí quyết nằm ở việc ngâm trong nước tro từ giếng Bá Lễ cổ. Món ăn này ít nước dùng, nhưng đậm đà hương vị.",
    "image": "Cao Lầu Hội An.webp"
  },
  {
    "name": "Bánh Căn Nha Trang",
    "price": 40000,
    "description": "Món bánh nóng hổi, giòn rụm làm từ bột gạo, được đổ trong khuôn đất nung trên bếp than hồng. Bánh căn có nhiều loại nhân: tôm, mực, trứng, thịt băm... ăn kèm với rau sống, xoài xanh băm.",
    "image": "Bánh Căn Nha Trang.webp"
  },
  {
    "name": "Mắt Cá Ngừ Đại Dương Phú Yên",
    "price": 100000,
    "description": "Đặc sản nổi tiếng của Phú Yên, cá ngừ đại dương được chế biến thành nhiều món hấp dẫn như mắt cá ngừ đại dương tiềm thuốc bắc (độc đáo và bổ dưỡng), gỏi cá ngừ, lẩu cá ngừ.",
    "image": "Mắt Cá Ngừ Đại Dương Phú Yên.webp"
  },
  {
    "name": "Bánh Bèo Huế",
    "price": 30000,
    "description": "Bánh bèo là một trong những món bánh truyền thống nổi tiếng nhất của xứ Huế mộng mơ. Bánh được làm từ bột gạo, hấp chín trong từng chén nhỏ, có độ mềm mượt, trắng ngần.",
    "image": "Bánh Bèo Huế.webp"
  },
  {
    "name": "Gỏi Cá Nam Ô Đà Nẵng",
    "price": 150000,
    "description": "Một món đặc sản nổi tiếng của vùng biển Nam Ô, Đà Nẵng, dành cho thực khách yêu thích hải sản. Gỏi cá Nam Ô được làm từ cá trích tươi sống, thái mỏng, trộn với riềng, tỏi, ớt, gừng và thính gạo.",
    "image": "Gỏi Cá Nam Ô Đà Nẵng.webp"
  },
  {
    "name": "Bánh Canh Hẹ Phú Yên",
    "price": 45000,
    "description": "Món ăn dân dã nhưng cực kỳ cuốn hút của Phú Yên. Bánh canh hẹ nổi bật với màu xanh đặc trưng của hẹ thái nhỏ rắc đầy trên mặt tô. Nước dùng được nấu từ xương heo và cá, ngọt thanh, trong vắt.",
    "image": "Bánh Canh Hẹ Phú Yên.webp"
  },
  {
    "name": "Bánh Tráng Cuốn Thịt Heo Hai Da Đà Nẵng",
    "price": 150000,
    "description": "Món ăn nổi bật với thịt heo ba chỉ luộc hai da mềm ngọt, giòn béo, được thái lát mỏng. Khi thưởng thức, bạn sẽ dùng bánh tráng phơi sương cuốn cùng thịt, đa dạng các loại rau sống miền Trung.",
    "image": "Bánh Tráng Cuốn Thịt Heo Hai Da Đà Nẵng.webp"
  },
  {
    "name": "Canh Don Quảng Ngãi",
    "price": 30000,
    "description": "Đây là món ăn dân dã, đặc trưng của vùng đất miền Trung, mang đến hương vị thanh mát từ sông nước. Don là một loại hến nhỏ, được chế biến thành món canh don với nước dùng trong, ngọt lịm từ don.",
    "image": "Canh Don Quảng Ngãi.webp"
  },
  {
    "name": "Bánh Mì Xíu Mại Đà Lạt",
    "price": 45000,
    "description": "Món ăn sáng trứ danh Đà Lạt, bánh mì xíu mại là sự kết hợp hoàn hảo giữa những viên xíu mại nóng hổi, mềm mịn trong chén nước dùng xương ngọt thanh.",
    "image": "Bánh Mì Xíu Mại Đà Lạt.webp"
  },
  {
    "name": "Bánh Mì Sài Gòn",
    "price": 30000,
    "description": "Bánh mì Sài Gòn, món ăn quen thuộc nhưng từ lâu đã vượt ra khỏi biên giới Việt Nam để chinh phục khẩu vị của thực khách toàn cầu. Từng miếng cắn là một trải nghiệm trọn vẹn: vỏ bánh giòn rụm hoàn hảo hòa quyện cùng các loại nhân đầy đặn.",
    "image": "Bánh Mì Sài Gòn.webp"
  },
  {
    "name": "Lẩu Mắm Miền Tây",
    "price": 300000,
    "description": "Khi đến miền Tây, đừng bỏ lỡ cơ hội thưởng thức lẩu mắm nhé. Món lẩu này nổi bật với hương vị đậm đà từ mắm đặc trưng của vùng sông nước, kết hợp hài hòa cùng bún tươi và đa dạng các loại rau đồng.",
    "image": "Lẩu Mắm Miền Tây.webp"
  },
  {
    "name": "Bánh Cống Cần Thơ",
    "price": 30000,
    "description": "Bánh cống Cần Thơ, món ăn dân dã từ miền Tây, luôn giữ vị trí đặc biệt trong lòng du khách. Sức hấp dẫn của bánh cống đến từ lớp vỏ giòn rụm, nhân tôm tươi ngon, kết hợp hài hòa với rau sống thanh mát.",
    "image": "Bánh Cống Cần Thơ.webp"
  },
  {
    "name": "Bánh Khọt Vũng Tàu",
    "price": 110000,
    "description": "Đến Vũng Tàu, bánh khọt là món bạn nhất định phải thử. Tuy đơn giản, món ăn này lại mang hương vị đặc trưng của biển, chinh phục cả người dân địa phương lẫn du khách. Những chiếc bánh khọt vàng ươm, giòn rụm, với nhân tôm tươi to tròn.",
    "image": "Bánh Khọt Vũng Tàu.webp"
  },
  {
    "name": "Kẹo Dừa Bến Tre",
    "price": 50000,
    "description": "Kẹo dừa Bến Tre là đặc sản gắn liền với ký ức tuổi thơ của nhiều thế hệ người Việt, đặc biệt trong những dịp Tết đến xuân về. Món kẹo này là sự hòa quyện tinh túy của vị béo ngậy từ nước cốt dừa tươi, vị ngọt dịu của đường và hương thơm đặc trưng.",
    "image": "Kẹo Dừa Bến Tre.webp"
  },
  {
    "name": "Bò Tơ Tây Ninh",
    "price": 200000,
    "description": "Thịt bò tơ Tây Ninh nổi tiếng với hương vị thơm ngọt tự nhiên và độ mềm mịn đặc trưng, không bở như thịt bê mà phảng phất chút vị sữa non độc đáo.",
    "image": "Bò Tơ Tây Ninh.webp"
  },
  {
    "name": "Bánh Đúc Lá Dứa Miền Tây",
    "price": 15000,
    "description": "Bánh đúc lá dứa nước cốt dừa là món tráng miệng thân thương của miền Nam, gợi nhớ ký ức tuổi thơ với màu xanh tươi mát và hương vị ngọt ngào, béo ngậy. Từng miếng bánh mềm mại, thơm lừng mùi lá dứa.",
    "image": "Bánh Đúc Lá Dứa Miền Tây.webp"
  },
  {
    "name": "Gỏi Cá Trích Phú Quốc",
    "price": 150000,
    "description": "Gỏi cá trích là một món ăn đặc sản hấp dẫn của đảo ngọc Phú Quốc, thể hiện sự kết hợp tuyệt vời giữa thịt cá tươi sống và các nguyên liệu độc đáo từ đất liền, tạo nên hương vị đậm chất biển khó quên.",
    "image": "Gỏi Cá Trích Phú Quốc.webp"
  },
  {
    "name": "Bánh Pía Sóc Trăng",
    "price": 150000,
    "description": "Bánh Pía Sóc Trăng là đặc sản nức tiếng với hương vị tinh tế và chất lượng hoàn hảo. Vỏ bánh mềm mịn, đa lớp, bao bọc nhân đậu xanh sầu riêng hoặc khoai môn sầu riêng thơm lừng.",
    "image": "Bánh Pía Sóc Trăng.webp"
  },
  {
    "name": "Hủ Tiếu Mỹ Tho",
    "price": 65000,
    "description": "Hủ tiếu Mỹ Tho là đặc sản của Tiền Giang, hấp dẫn bởi hương vị thanh tao và sợi hủ tiếu dai, trong được làm từ gạo Gò Cát. Nước dùng ninh từ xương heo và tôm khô ngọt thanh.",
    "image": "Hủ Tiếu Mỹ Tho.webp"
  },
  {
    "name": "Mắm Châu Đốc",
    "price": 200000,
    "description": "Mắm Châu Đốc là đặc sản nổi tiếng, biểu tượng ẩm thực của vùng đất An Giang. Với màu sắc đậm đà và mùi thơm đặc trưng, loại mắm này được chế biến tinh tế từ cá linh tươi ngon.",
    "image": "Mắm Châu Đốc.webp"
  },
  {
    "name": "Bún Quậy Phú Quốc",
    "price": 70000,
    "description": "Bún quậy Phú Quốc nổi bật với sự kết hợp phong phú của mực, chả tôm và chả cá tươi được làm chín tại chỗ, mang đến vị ngọt tự nhiên. Tên gọi \"bún quậy\" xuất phát từ cách pha chế nước chấm.",
    "image": "Bún Quậy Phú Quốc.webp"
  }
]
