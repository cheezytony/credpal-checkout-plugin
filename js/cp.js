class CP_APP {

	view = {
		activeViewClass: null,
		currentView: null,
		index: 0,
		nextindex: null,
		nextView: null,
		prevIndex: null,
		prevView: null,
		viewSelector: null,
		views: null,
		beforeViewChange () {},
		afterViewChange () {},
	};

	schedule = {
		duration: 1,
		range: null,
		rangeSelector: null,
		amount: 0
	}

	price = 0;
	symbol = 'N';

	constructor ({
		viewSelector, 
		index = 0, 
		schedule = 1, 
		rangeSelector, 
		price = 0, 
		beforeViewChange = this.beforeViewChange, 
		afterViewChange = this.afterViewChange,
		validation
	} = config) {

		this.price = price;
		this.view.viewSelector = viewSelector;
		this.view.activeViewClass = `${this.view.viewSelector}-active`;
		this.view.afterViewChange = afterViewChange;
		this.view.beforeViewChange = beforeViewChange;
		this.loadViews(this.view.viewSelector);
		this.decideViews(index);
		this.showView();
		// Emit View Change Event
		this.view.afterViewChange(this.view.index, this.view.prevIndex, this.view.currentView);

		// Validation
		this.validation = validation;

		// Range Slider
		this.loadRange(rangeSelector);
		this.setSchedule(schedule);

	}

	loadViews (selector) {
		this.view.views = $(selector);
	}

	decideViews (index = this.view.index) {
		this.view.index = typeof index == 'number' ? index : 0;
		this.view.currentView = this.view.views.eq(this.view.index);
		this.view.nextIndex = this.view.index + 1 >= this.view.views.length ? 0 : this.view.index + 1;
		this.view.prevIndex = this.view.index <= 0 ? this.view.views.length - 1 : this.view.index - 1;
		this.view.nextView = this.view.views.eq(this.view.nextIndex);
		this.view.prevView = this.view.views.eq(this.view.prevIndex);
	}

	showView () {
		this.view.views.hide().removeClass(this.view.activeViewClass);
		this.view.currentView.show().addClass(this.view.activeViewClass);
	}

	next () {
		if (this.view.beforeViewChange(this.view.nextIndex, this.view.index) == false) {
			return false;
		}
		this.view.index = this.view.nextIndex;
		this.decideViews();
		this.showView();
		this.view.afterViewChange(this.view.index, this.view.prevIndex, this.view.currentView);
	}

	prev () {
		if (this.view.beforeViewChange(this.view.prevIndex, this.view.index) == false) {
			return false;
		}
		this.view.index = this.view.prevIndex;
		this.decideViews();
		this.showView();
		this.view.afterViewChange(this.view.index, this.view.nextIndex, this.view.currentView);
	}

	to (index = 0) {
		if (this.view.beforeViewChange(index, this.view.index) == false) {
			return false;
		}
		var oldIndex = this.view.index;
		this.view.index = typeof index == 'number' ? index : this.view.index;
		this.decideViews();
		this.showView();
		this.view.afterViewChange(this.view.index, oldIndex, this.view.currentView);
	}

	loadRange (selector) {
		this.schedule.range = $(selector);
	}

	setSchedule (duration) {
		this.schedule.duration = duration;
		this.schedule.range.val(duration);
		this.schedule.amount = this.price / duration;
		$('.cp-payment-amount').text(`${this.symbol}${this.schedule.amount.toFixed(2)}`);
		$('.cp-payment-month').text(`${duration} Month${duration==1?'':'s'}`);
		$('.cp-payment-range-labels span')
			.removeClass('cp-active')
			.eq(duration - 1)
			.addClass('cp-active');
	}

	ajax (a) {
		return $.ajax(a);
	}

	login () {
		if (!this.view.index == 0) {return false;}

		if (!this.validate(0)) {return false;}

		this.loading();

		this.ajax({
			url: this.urls.login,
			method: 'POST',
			data: {
				email: $('[name="email"]').val(),
				password: $('[name="password"]').val()
			}
		})
		.then(() => {
			this.loading(false);
			if (true) {
				this.to(1);
			}
		}, () => {
			this.loading(false);
		});

	}

	loading (status = true) {
		this.view.currentView.addClass('cp-tab-loading');
	}

	validate (step, all = false) {
		var rules = this.validation[step];
		var length = Object.keys(rules).length;
		var totalValid = 0;
		for (var element in rules) {
			var rule = rules[element];
			if (this.validateField(element, rule, all) === true) {
				totalValid++;
			}
		}
		return totalValid == length;
	}

	validateField (name, rule, all = false) {
		let el = $(`[name=${name}]`);
		let value = el.val();
		let msg = 'This Field Is Required';
		let valid = !!value.length;
		if (valid && rule) {
			if (rule.match(/phone/i)) {
				valid = value.match(/^[\d- ]+$/);
				msg = 'Invalid Number Format';
			}
			if (rule.match(/bvn/i)) {
				valid = value.match(/^\d{11}$/);
				msg = 'BVN Has To Be 11 Digits';
			}
			if (rule.match(/email/i)) {
				valid = value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
				msg = "Invalid Email Format";
			}
		}
		if (valid) {
			el.closest('.cp-input-group')
			.removeClass('animated shake cp-error').addClass('cp-success')
			$(`[data-alert="${name}"]`).html('');


		}else {
			el.closest('.cp-input-group')
			.removeClass('cp-success').addClass('animated cp-error')
			$(`[data-alert="${name}"]`).html(msg);
			if (all) {
				el.addClass('shake');
			}
			setTimeout(function() {
				el.removeClass('animated shake');
			}, 1000);
		}
		return !!valid;
	}

}

(function($) {

	function listen(a, b, c) {
		return $('body').on(a, b, c);
	}

	function live(a, b, c) {
		return $(window).on(a, b, c);
	}



	// Validation Definition

	var validation = [
		{
			email: 'required|email',
			password: 'required'
		},
		{},
		{
			bvn: 'required|bvn',
			company_name: 'required'
		}
	];




	// App Instanciation

	window.app = new CP_APP({
		viewSelector: '.cp-tab',
		index: 0,
		rangeSelector: '.cp-payment-range',
		schedule: 1,
		price: 26750,
		validation,
		beforeViewChange (to, from, toView, fromView) {
			if (from > to) {return true;}
			return app.validate(from);
			// return true;
		},
		afterViewChange (current, from, currentView) {
			var progress = (100 / 3 * current);
			progress = progress > 100 ? 100 : progress;
			$('.cp-progress-bar').width(progress + '%');
			$('.cp-progress-label').html(current == 4 ? 'done' : `Step ${current} of 3`);
			if (current == 0) {
				$('.cp-navigation, .cp-progress, .cp-progress-label, .general-submit').hide();
				$('#finish').hide();
			}else if (current == 4) {
				$('.cp-navigation, .general-submit').hide();
				$('#finish').show();
			}else {
				$('.cp-navigation ul li').eq(current - 1).find('a').addClass('cp-tab-ready');
				$('.cp-navigation, .cp-progress, .cp-progress-label, .general-submit').show();
				$('#finish').hide();
			}
		}
	});

	app.urls = {
		login: 'https://reqres.in/api/login',

	}





	// Event Listeners

	listen('click', '.cp-next-tab', (event) => {
		event.preventDefault();
		app.next();
	});

	listen('click', '[data-cp-tab-to]', function (event) {
		event.preventDefault();
		app.to($(this).data('cp-tab-to'));
	});

	listen('click', '[data-cp-schedule-to]', function (event) {
		event.preventDefault();
		app.setSchedule($(this).data('cp-schedule-to'));
	});

	listen('click', '[data-login]', function (event) {
		event.preventDefault();
		app.login();
	});

	listen('input', 'input[name], select[name]', function (event) {
		var name = $(this).attr('name');
		var rule = app.validation[app.view.index][name];
		app.validateField(name, rule);
	});

	listen('change input', '.cp-payment-range', function (event) {
		app.setSchedule($(this).val());
	});

})(jQuery)