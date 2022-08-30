const $ = document.querySelector.bind(document);



// Hàm Validator( Constructor function)
function Validator(option) {

    var selectorRules = {};



    // Hàm thực hiện nhập có đúng hay không
    function validate(inputElement, rule, errorElement) {

        var errorMessage;
        
        // Lấy ra các Rule của Selecter
        var rules = selectorRules[rule.selector]
            // Lặp đến khi có lỗi thì dừng kiểm tra
            for(var i=0; i<rules.length; i++) {
                errorMessage = rules[i](inputElement.value); 
                if(errorMessage) break;
            }
         

            if (errorMessage) {
                errorElement.innerText = errorMessage
                inputElement.parentElement.classList.add('invalid')
            } else {
                errorElement.innerText = ''
                inputElement.parentElement.classList.remove('invalid')
            }

        return !errorMessage;
    }

    var formElements = document.querySelector(option.form);
    
    if (formElements) {

        // Khi Submit Form (Bấm nút đăng kí sẽ rà soát lại form)
        formElements.onsubmit = function(e) {
            e.preventDefault()


            var isFormValid = true;


            // Thực hiện lặp qua từng rules và Validate lấy ngay cái đầu tiên
            option.rules.forEach(function(rule) {
                var inputElement = formElements.querySelector(rule.selector)
                var errorElement = inputElement.parentElement.querySelector('.form--message');
                var isValid = validate(inputElement, rule, errorElement)
                if (!isValid) {
                    isFormValid = false;
                }
            });


            
            // console.log(formValues)
            
            // Lấy ra toàn bộ các HTML input
            var enableInputs = formElements.querySelectorAll('[name]:not([disabled])'); // OR var enableInputs = formElements.querySelectorAll('input')
            // Phút 30:00 F8 Form Validator phần 2; disabled: dùng để vô hiệu hóa DOM HTML(gán trục tiếp vào html Attributes)
            

            var formValues = Array.from(enableInputs).reduce(function(values, input) {
                return (values[input.id/** hoặc input.name */] = input.value) && values;
            }, {});

            if (isFormValid) {                
                if (typeof option.onSubmit === 'function') {
                    option.onSubmit(formValues);
                } 
            } else {
                console.error('Co loi')
            }
        }


        // Xử lý lặp qua mỗi rules(sụ kiên blur,...)
        option.rules.forEach(function(rule) {

            // Thêm object của các lệnh rules
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }


            var inputElement = formElements.querySelector(rule.selector)
            var errorElement = inputElement.parentElement.querySelector('.form--message');


            if (inputElement) {
                // Xử lý blur khỏi inPut
                inputElement.onblur = function() {                    
                    validate(inputElement, rule, errorElement)       
                }                  
                
                // Xử lý mồi khi người dùng nhập kí tự vào input
                    inputElement.oninput = function() { 
                    errorElement.innerText = ''
                    inputElement.parentElement.classList.remove('invalid')
                }
            }
        }); 
    }

}


// Định nghĩa các rules
// Nguyên tác các rules
// 1. Khi có lỗi thì trả ra message lỗi
// 2. Khi hợp lệ thì không trả ra gì cả (undefined)
Validator.isRequired = function(selector, message) {

    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này';
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập email vào trường này'
        }
    }
}

Validator.isPassword = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}


Validator.isPasswordAgain = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value == $('#form-1 #password').value ? undefined : message || `Giá trị nhập vào không chính xác`
        }
    }
}