$(document).ready(function() {

	//load data from json
	loadData();	

	//initialize all modals
	$('.modal').modal();

	//add action listeners to card buttons 
	$( "div.container" ).on('click','a.modal-triger.red', openDeleteModal);
	$( "div.container" ).on('click','a.modal-triger.yellow', openFormatModal);
	
	//add action listeners to modals buttons
	$('#deleteButton').on('click', deleteCard);
	$('#formatButton').on('click', formatCard);

	//add action listener to my-fixed-button
	$('#my-fixed-button a').on('click', openNewModal);
	$('#createButton').on('click', createNewModal);	
});



//collect data from Json and display cards
function loadData(){
	// Retrieve the template data from the HTML (jQuery is used here).
	template = $('#entry-template').html();
	// Compile the template loadData into a function
	templateScript = Handlebars.compile(template);

	//find all cards from Cards List
	Trello.get("/lists/" + '5a22e582182a8984a90ebcdb' + "/cards", function (resp) {
		var id = 0;
		resp.forEach(function(d){

			//find all attachments from each card (it works only if we have 1 attachment)
			var imageUrl;
			Trello.get('cards/' +d.id+ '/attachments', function(attachments){
				// Use the data that we need with handlebars
				var context = { "id": id, "title": d.name, "body": d.desc, "image": attachments[0].url };
				var html = templateScript(context);
				// Insert the HTML code into the page
				$("#entry-template").append(html);
				//append the new card
				$("#main").append(html);
				//if image does not exist then use an error image
				$("img").on('error', function() { 
					$(this).attr("src", 'http://indembassy.com.vn/images/error.png');
				});
			})
			  
			id++;
		})

      	lastId = countId = id; //count is equal with the last id given
		//set the quotes count 
		$('#count').text(countId);

		loadPagination(countId);//needs to be done after the card elements are ready

    }, function (error) { console.log("error:", error) });
}


//open delete modal
function openDeleteModal(){
	//find which element trigered the modal 
	//$(this) is the button
	//find the root parent 
	modalTriger = $(this).parents('.card').parent();
	// //open modal
	$('#modalDelete').modal('open');
}

//remove card 
function deleteCard(){
	$(modalTriger).remove();
	Materialize.toast('Card ' + modalTriger.attr('id') + ' Deleted!', 4000);
	$('#count').text(--countId);//decrease count and display
}



//open format modal
function openFormatModal(){
	//find which element trigered the modal 
	//find the root parent 
	modalTriger = $(this).parents('.card').parent();

	//open modal
	$('#modalFormat').modal('open');

	//find the children with class resizeimg and get the src attribute
	trigerUrl = $(modalTriger).find('.resizeimg').attr('src');
	$('#image_url').val(trigerUrl);

	// find the children with class card-title and get the value
	trigerTitle = $(modalTriger).find('.card-title').text();
	$('#image_title').val(trigerTitle);

	//find the children with class card-content and get the text
	trigerContent = $(modalTriger).find('.card-content').children().text();
	$('#image_description').val(trigerContent);

}

//format modal
function formatCard(){
	//find the children with class resizeimg and set the src attribute
	$(modalTriger).find('.resizeimg')
								.attr( 'src',$('#image_url').val() );
	// // find the children with class card-title and set the value
	$(modalTriger).find('.card-title')
								.text( $('#image_title').val() );
	// //find the children with class card-content and set the text	
	$(modalTriger).find('.card-content').children()
								.text( $('#image_description').val() );

	Materialize.toast('Card ' + modalTriger.attr('id') + ' Formated!', 4000);	

}



//open new card modal
function openNewModal(){
	clearData();
	//open modal
	$('#modalNew').modal('open');
}

function createNewModal(){

	//get the input from the modal
	var  getImage = $('#add_image_url').val();
	var getAuthor = $('#add_image_title').val();
	var getQuote = $('#add_image_description').val();

	var context = { "id": lastId++ ,"title":getAuthor, "body":getQuote, "image":getImage };
	var html = templateScript(context);

	//append the new card
	$("#main").append(html);
	//if image does not exist then use an error image
	$("img").on('error', function() { 
		$(this).attr("src", 'http://indembassy.com.vn/images/error.png');
	});

	//set the quotes count 
	$('#count').text(++countId);
	Materialize.toast('New Card ' + lastId + ' Created!', 4000);
	//----Clear data-----//
	clearData();
}

function clearData(){
	 $('#add_image_url').val('');
	 $('#add_image_url').off( "focus" );
	 $('#add_image_title').val('');
	 $('#add_image_title').off( "focus" );
	 $('#add_image_description').val('');
	 $('#add_image_description').off( "focus" );
}

//add pagination and listeners
function loadPagination(cnt){
	const cardsPerPage = 8;
	var howManyPages = Math.ceil( cnt / cardsPerPage );

	//set always on start p1 active and visible 
	$('#body').on('click', '#p1', function(){
			setActive($(this));
			setCardsInvisible();
			setCardsVisible(0, cardsPerPage-1);
			$('#leftArrow').addClass('disabled');
	});

	//add rest list elements and listeners
	for( let i=2; i<=howManyPages; i++){//let keyword makes the i variable local to the loop instead of global
		$('.pagination').append('<li class=".page waves-effect"><a id=p' +i+ ' href="#">' +i+ '</a></li>');
		
		$('#body').on('click', '#p'+i,function(){
			
			setActive($(this));
			setCardsInvisible();
			setCardsVisible(i*cardsPerPage-cardsPerPage, i*cardsPerPage-1);
			$('#leftArrow').removeClass('disabled');
			
			if( $(this).attr('id') == 'p'+howManyPages ){//if this is the last page
				$('#rightArrow').addClass('disabled');
			}else{
				$('#rightArrow').removeClass('disabled');
			}

		});
		// console.log('range: '+(i*cardsPerPage-cardsPerPage)+' '+(i*cardsPerPage-1));	
	}

	//if there is only one page set right arrow disable
	if( $('.pagination li').length == 2){// 3 li (two arrows and one page)
		$('rightArrow').addClass('disabled');
	}else{
		$('rightArrow').removeClass('disabled');
	}

	//triger to reveal the first 20 elements
	$('#p1').click();
	
	//left arrow listener
	$('#body').on('click', '#leftArrow', function(){
		if( !$(this).hasClass('disabled') ){
			var currentActive = $(this).siblings('.active');
			$(currentActive).removeClass('active');
			$(currentActive).prev().addClass('active');
			$(currentActive).prev().children().click();
		}
	});

	//right arrow listener
	$('#body').on('click', '#rightArrow', function(){
		if( !$(this).hasClass('disabled') ){
			var currentActive = $(this).siblings('.active');
			$(currentActive).removeClass('active');
			$(currentActive).next().addClass('active');
			$(currentActive).next().children().click();
		}
	});

	//add the right arrow
	$('.pagination').append('<li id="rightArrow" class="waves-effect"><a href="#"><i class="material-icons">chevron_right</i></a></li>');
	

	function setActive(p){
		$(p).parent().addClass('active');
		$(p).parent().siblings().removeClass('active');
	}

	function setCardsVisible(min,max){
		$('.cell').each(function(i,obj){
			if( $(obj).attr('id')>=min && $(obj).attr('id')<=max ){
				$(obj).fadeIn('slow');
			}
		});
	}

	function setCardsInvisible(){
		$('.cell').each(function(i,obj){
			$(obj).fadeOut('slow');
		});
	}

}

